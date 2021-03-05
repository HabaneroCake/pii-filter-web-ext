import { browser, Tabs, Runtime, WebNavigation } from 'webextension-polyfill-ts';

import * as pf from 'pii-filter';

import { Binding } from './common/binding';
import { ICommonMessage } from './common/common-messages';
import { HANDLE_FILTER_REQUEST, HANDLE_FOCUS } from './common/endpoint-names';

import { PortManager } from './service/port-manager';
import { TabState } from './service/tab-state';
import { FilterRequest } from './service/filter-request';

const WELL_FORMED_OVERRIDE:     boolean =   true;

export class PIIFilterService
{
    private pii_filter:     pf.PIIClassifier;
    private ports:          PortManager =           new PortManager();
    private bindings:       Array<Binding> =        new Array<Binding>();
    private endpoints:      Map<string, (
                                            tab_state: TabState,
                                            message: any,
                                            tab: number,
                                            frame: number,
                                            port: Runtime.Port
                                        ) => void> = new Map();

    private tab_stack:      Map<number, TabState> = new Map();
    private latest_request: () => Promise<void>;
    
    constructor()
    {
        // load PII Filter
        (async () => {
            this.pii_filter = pf.make_pii_classifier(pf.languages.nl.make_lm());
            if (this.latest_request != null)
                this.latest_request();
        })();

        // create endpoints
        this.endpoints.set(HANDLE_FOCUS, this.handle_focus.bind(this));
        this.endpoints.set(HANDLE_FILTER_REQUEST, this.handle_filter_request.bind(this))

        // bind port creation
        this.bindings.push(
            new Binding(
                browser.runtime.onConnect.addListener.bind(browser.runtime.onConnect),
                browser.runtime.onConnect.removeListener.bind(browser.runtime.onConnect),
                (port: Runtime.Port): void => {
                    const tab:      number = port.sender.tab.id;
                    const frame:    number = port.sender.frameId;
                    const name:     string = port.name;

                    if (!this.endpoints.has(name))
                        throw new Error(`Endpoint ${name} does not exist`);

                    const endpoint = this.endpoints.get(name);
                    const message_binding = new Binding(
                        port.onMessage.addListener.bind(port.onMessage),
                        port.onMessage.removeListener.bind(port.onMessage),
                        (message: any, port: Runtime.Port): void => {
                            endpoint(this.tab_stack.get(tab), message, tab, frame, port);
                        }
                    );
                    const disconnect_binding = new Binding(
                        port.onDisconnect.addListener.bind(port.onDisconnect),
                        port.onDisconnect.removeListener.bind(port.onDisconnect),
                        (port: Runtime.Port): void => {
                            message_binding.unbind();
                            disconnect_binding.unbind();
                            const [
                                rm_tab, rm_frame, rm_port
                            ] = this.ports.remove(tab, frame, name);
                            if (rm_port)
                                this.port_removed(rm_tab, rm_frame, tab, frame, name);
                        }
                    );
                    const [
                        new_tab, new_frame, new_port
                    ] = this.ports.add(tab, frame, name, port);
                    if (new_port)
                        this.port_added(new_tab, new_frame, tab, frame, name, port);
                    
                    this.bindings.push(message_binding);
                    this.bindings.push(disconnect_binding);
                }
            )
        );
    }
    private port_added(new_tab: boolean, new_frame: boolean, tab: number, frame: number, name: string, port: Runtime.Port)
    {
        if (new_tab)
        {
            if (this.tab_stack.has(tab))
                throw new Error(`Tab ${tab} already exists.`);
            else
                this.tab_stack.set(tab, new TabState());
        }
    }
    private port_removed(rm_tab: boolean, rm_frame: boolean, tab: number, frame: number, name: string)
    {
        const tab_state: TabState = this.tab_stack.get(tab);
        if (tab_state != null)
        {
            if (rm_frame)
            {
                if (tab_state.has_focused(frame))
                    tab_state.reset_focus();
            }
            if (rm_tab)
                this.tab_stack.delete(tab);
        }
    }

    private handle_focus(
        tab_state: TabState,
        message: ICommonMessage,
        tab: number,
        frame: number,
        port: Runtime.Port
    )
    {
        switch(message.type)
        {
            // Focus changed
            case ICommonMessage.Type.FOCUS: {
                let f_message =             (message as ICommonMessage.Focus);
                // unfocus last frame if this didn't happen automatically when focusing another frame
                if (!tab_state.last_focused.equal(frame))
                {
                    const last_focused_port = this.ports.get(tab, tab_state.last_focused.frame, HANDLE_FOCUS);
                    if (last_focused_port != null)
                        last_focused_port.postMessage(new ICommonMessage.Focus(false));
                    
                    tab_state.clear_last_focus();
                }

                // element was blurred, clear values
                if (!f_message.valid)
                {
                    const top_filter_req_port = this.ports.get(tab, 0, HANDLE_FILTER_REQUEST);
                    top_filter_req_port.postMessage(new ICommonMessage.NotifyPII(0.0, [], true));
                    tab_state.clear_last_focus();
                }
                else
                    tab_state.set_focus(frame);

                break;
            }
            // Refocus requested
            case ICommonMessage.Type.REFOCUS: {
                if (tab_state.restorable_focus.valid)
                {
                    const last_restorable_port = this.ports.get(tab, tab_state.restorable_focus.frame, HANDLE_FOCUS);
                    if (last_restorable_port != null)
                        last_restorable_port.postMessage(new ICommonMessage.Focus(true));

                    // TODO: need to set last valid focus here? something like tab_state.focus_restored();
                }
                
                break;
            }
            default:
                throw new Error(`Message type ${message.type} does not exist for handle_focus.`);
        }
    }

    private handle_filter_request(
        tab_state: TabState,
        message: any,
        tab: number,
        frame: number,
        port: Runtime.Port
    )
    {
        switch(message.type)
        {
            // Text needs to be parsed
            case ICommonMessage.Type.TEXT_ENTERED: {
                const text: string = (message as ICommonMessage.TextEntered).text;
                this.parse_request(new FilterRequest(text, tab, frame));
                break;
            }
            default:
                throw new Error(`Message type ${message.type} does not exist for handle_filter_request.`);
        }
    }
    
    // classify or schedule request
    private parse_request(request: FilterRequest)
    {
        const no_request_active: boolean = this.latest_request == null;
        const current_request = async () => {
            // classify request
            const result = this.pii_filter.classify(request.text, WELL_FORMED_OVERRIDE);
            const tab_state: TabState = this.tab_stack.get(request.tab);
            if (tab_state != null)
            {
                const frame_port = this.ports.get(request.tab, request.frame, HANDLE_FILTER_REQUEST);
                if (frame_port != null)
                {
                    // notify request port
                    frame_port.postMessage(new ICommonMessage.NotifyPII(
                        result.severity,
                        result.pii,
                        false
                    ));
                    
                    // notify the topmost frame as well
                    if (request.frame != 0)
                    {
                        const top_frame_port = this.ports.get(request.tab, 0, HANDLE_FILTER_REQUEST);
                        if (top_frame_port != null)
                        {
                            frame_port.postMessage(new ICommonMessage.NotifyPII(
                                result.severity,
                                result.pii,
                                true
                            ));
                        }
                    }
                }
            }

            // handle next request or clean up
            if (this.latest_request != current_request)
                this.latest_request();
            else
                this.latest_request = null;
        };

        this.latest_request = current_request;
        if (this.pii_filter != null && no_request_active)
            this.latest_request();
    }

    public remove()
    {
        for (const binding of this.bindings)
            binding.unbind();
    }
};

const pii_filter_service = new PIIFilterService();  

const welcome_binding = new Binding(
    browser.runtime.onInstalled.addListener.bind(browser.runtime.onInstalled),
    browser.runtime.onInstalled.removeListener.bind(browser.runtime.onInstalled),
    (details: Runtime.OnInstalledDetailsType) => {
        browser.tabs.create({
            url: "assets/success.html"
        });
    },
);

const window_unload_binding = new Binding(
    window.addEventListener.bind(window),
    window.removeEventListener.bind(window),
    () => {
        pii_filter_service.remove();
        welcome_binding.unbind();
        window_unload_binding.unbind();
    },
    'unload'
);