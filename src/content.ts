import { browser, Runtime, Storage } from 'webextension-polyfill-ts';

import { Binding } from './common/binding';
import { ICommonMessage } from './common/common-messages';
import { HANDLE_FILTER_REQUEST, HANDLE_FOCUS } from './common/endpoint-names';

import { Utils } from './content/utils';
import { DOMFocusManager } from './content/dom-focus-manager';
import { PIIFilterInfoOverlay } from './content/pii-filter-info-overlay';
import { RangeHighlighter } from './content/text-entry-highlighter/range-highlighter';
import { BoxHighlightContentParser } from './content/text-entry-highlighter/box-highlight-content-parser';
import { TextEntryHighlighter } from './content/text-entry-highlighter/text-entry-highlighter';
import { BoxIntensityRange } from './content/text-entry-highlighter/box-highlight-range';

function listen_setting<T>(id: string, def: T, on_changed: (new_value: T) => void)
{
    
    // Get settings at start
    browser.storage.local.get({[id]: def}).then(
        (result: { [s: string]: any; }) => {
            on_changed(result[id]);
        }, 
        (error)=>console.log(`Error: ${error}`)
    );

    // Listen to main settings changes
    const storage_binding = new Binding(
        browser.storage.onChanged.addListener,
        browser.storage.onChanged.removeListener,
        (changes: { [s: string]: Storage.StorageChange; }, area_name: string) => {
            if (Object.keys(changes).includes(id))
                on_changed(changes[id].newValue);
        }
    );

    // Clear listener on unload
    const window_unload_binding = new Binding(
        window.addEventListener.bind(window),
        window.removeEventListener.bind(window),
        () => {
            storage_binding.unbind();
            window_unload_binding.unbind();
        },
        'unload'
    );
}

namespace PII_Filter
{
    export class Frame
    {
        protected bindings:                 Array<Binding> =           new Array<Binding>();
        protected focus_port:               Runtime.Port;
        protected filter_port:              Runtime.Port;

        protected input_focus_manager:      DOMFocusManager =           new DOMFocusManager(document);
        protected initialized:              boolean =                   false;
        protected active_element_:          HTMLInputElement;
        protected last_active_element:      HTMLInputElement;

        protected highlighter:              RangeHighlighter;
        protected content_parser:           BoxHighlightContentParser;
        protected text_entry_highlighter:   TextEntryHighlighter;
        protected resolver:                 (ranges: Array<BoxIntensityRange>) => void;

        protected active:                   boolean = false;
        protected highlighter_active:       boolean = false;

        constructor()
        {
            listen_setting<boolean>(
                'active',
                false,
                (new_value: boolean) => {
                    this.active = new_value;
                    if (new_value)
                    {
                        this.activate();
                    } 
                    else 
                    {
                        this.highlighter.clear();
                        this.pause();
                    }
                }
            );
            listen_setting<boolean>(
                'highlights-active',
                false,
                (new_value: boolean) => {
                    this.highlighter_active = new_value;
                    if (!new_value)
                        this.highlighter.clear();
                }
            );
            
            // TODO: dedup, will need to be able to set this.{el} to null
            // connect to focus port
            this.focus_port = browser.runtime.connect(null, {name: HANDLE_FOCUS});
            
            // focus message port binding
            const focus_port_message_binding = new Binding(
                this.focus_port.onMessage.addListener.bind(this.focus_port.onMessage),
                this.focus_port.onMessage.removeListener.bind(this.focus_port.onMessage),
                (message: any, port: Runtime.Port): void => {
                    this.handle_focus(message);
                }
            );

            // disconnect binding
            const focus_port_disconnect_binding = new Binding(
                this.focus_port.onDisconnect.addListener.bind(this.focus_port.onDisconnect),
                this.focus_port.onDisconnect.removeListener.bind(this.focus_port.onDisconnect),
                (port: Runtime.Port): void => {
                    focus_port_message_binding.unbind();
                    focus_port_disconnect_binding.unbind();
                    this.focus_port = null;
                    // TODO: retry connect?
                }
            )

            this.bindings.push(focus_port_message_binding);
            this.bindings.push(focus_port_disconnect_binding);

            // connect to filter port
            this.filter_port = browser.runtime.connect(null, {name: HANDLE_FILTER_REQUEST});

            // filter message port binding
            const filter_port_message_binding = new Binding(
                this.filter_port.onMessage.addListener.bind(this.filter_port.onMessage),
                this.filter_port.onMessage.removeListener.bind(this.filter_port.onMessage),
                (message: any, port: Runtime.Port): void => {
                    this.handle_filter(message);
                }
            );

            // disconnect binding
            const filter_port_disconnect_binding = new Binding(
                this.filter_port.onDisconnect.addListener.bind(this.filter_port.onDisconnect),
                this.filter_port.onDisconnect.removeListener.bind(this.filter_port.onDisconnect),
                (port: Runtime.Port): void => {
                    filter_port_message_binding.unbind();
                    filter_port_disconnect_binding.unbind();
                    this.filter_port = null;
                    // TODO: retry connect?
                }
            )
            
            this.bindings.push(filter_port_message_binding);
            this.bindings.push(filter_port_disconnect_binding);

            // highlighting and input
            this.highlighter = new RangeHighlighter();
            this.content_parser = new BoxHighlightContentParser(
                (text: string, resolver: (ranges: Array<BoxIntensityRange>) => void) => 
                {
                    if (this.resolver == null && this.active)
                    {
                        this.resolver = resolver;
                        if (this.filter_port != null)
                            this.filter_port.postMessage(new ICommonMessage.TextEntered(text))
                    }
                });
            this.text_entry_highlighter = new TextEntryHighlighter(
                document,
                this.highlighter,
                this.content_parser
            )

            // TODO: make part of text_entry_highlighter
            // Register input management
            this.input_focus_manager.active_focus.observe((element: HTMLElement) => {
                let is_text_input: boolean = element != null && Utils.DOM.is_text_input(element);

                if (is_text_input)
                {
                    this.active_element = element as HTMLInputElement;

                    if (this.focus_port != null)
                        this.focus_port.postMessage(new ICommonMessage.Focus(true));
                }
                else 
                {
                    if (this.focus_port != null)
                        this.focus_port.postMessage(new ICommonMessage.Focus(false));

                    this.active_element = null;
                }
            });
        }

        protected handle_focus(message: ICommonMessage)
        {
            switch(message.type) {
                case ICommonMessage.Type.FOCUS:
                {
                    let f_event = message as ICommonMessage.Focus;
                    if (!f_event.valid && this.active_element != null)
                    {
                        this.active_element = null;
                        this.input_focus_manager.unfocus();
                    }
                    else if (f_event.valid && this.active_element == null && this.last_active_element != null)
                    {   // restore focus
                        this.last_active_element.focus()
                    }
                    break;
                }
                default:
                    throw new Error(`Message type ${message.type} does not exist for handle_focus.`);
            }
        }

        protected handle_filter(message: ICommonMessage)
        {
            switch(message.type) {
                case ICommonMessage.Type.NOTIFY_PII:
                {
                    let n_message = message as ICommonMessage.NotifyPII;
                    this.handle_pii(n_message);
                    break;
                }
                default:
                    throw new Error(`Message type ${message.type} does not exist for handle_filter.`);
            }
        }

        protected set active_element(element: HTMLInputElement)
        {
            this.last_active_element =  this.active_element_;
            this.active_element_ =      element;
        }

        protected get active_element(): HTMLInputElement
        {
            return this.active_element_;
        }

        protected async handle_pii(message: ICommonMessage.NotifyPII)
        {
            if (!message.ignore_highlight)
            {
                let ranges: Array<BoxIntensityRange> = new Array<BoxIntensityRange>();
                if (this.active && this.highlighter_active)
                {
                    for (const pii of message.pii)
                    {
                        ranges.push({
                            start: pii.start_pos,
                            end: pii.end_pos,
                            intensity: pii.severity
                        });
                    }
                }
                // resolve request
                if (this.resolver != null)
                {
                    this.resolver(ranges);
                    this.resolver = null;
                }
                else
                    console.warn('resolver null');
            }
        }

        protected activate()
        {
            if (document.activeElement != null)
            {
                const el: HTMLElement = document.activeElement as HTMLElement;
                el.blur();
                el.focus();
            }
        }

        protected pause()
        {
            // TODO
        }

        public remove()
        {
            if (this.focus_port != null)
            {
                this.focus_port.disconnect();
                this.focus_port = null;
            }
            if (this.filter_port != null)
            {
                this.filter_port.disconnect();
                this.filter_port = null;
            }
            for (const binding of this.bindings)
                binding.unbind();
        }
    };

    /**
     * Top level frame (for drawing top level overlays)
     */
    export class Top extends Frame
    {
        private info_overlay:           PIIFilterInfoOverlay = null;
        constructor()
        {
            super();
            // info overlay
            this.info_overlay = new PIIFilterInfoOverlay(document);
            this.info_overlay.on_focus_required.observe((req: boolean) => {
                if (this.focus_port != null)
                    this.focus_port.postMessage(new ICommonMessage.Refocus());
            });
        }

        protected async handle_pii(message: ICommonMessage.NotifyPII)
        {
            super.handle_pii(message);
            
            if (this.active)
            {
                this.info_overlay.severity = message.severity_mapping;
                if (message.pii != null)
                    this.info_overlay.pii = message.pii;
            }
        }

        protected activate()
        {
            super.activate();
        }

        protected pause()
        {
            super.pause();
            this.info_overlay.hide();
        }
    };

    export function create()
    {
        return (window.self !== window.top) ? new Frame() : new Top();
    }
};

const pii_filter_content = PII_Filter.create();

const window_unload_binding = new Binding(
    window.addEventListener.bind(window),
    window.removeEventListener.bind(window),
    () => {
        pii_filter_content.remove();
        window_unload_binding.unbind();
    },
    'unload'
);
