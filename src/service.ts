import { browser, Tabs, Runtime, WebNavigation } from 'webextension-polyfill-ts';
import { ICommonMessage } from './common/common-messages';

import * as pf from 'pii-filter';

type message_callback = (message: ICommonMessage, sender: Runtime.MessageSender) => void;
class Tab {constructor(public callback: message_callback){}};

const WELL_FORMED_OVERRIDE: boolean = true;

export class PIIFilterService
{
    private pii_filter:     pf.PIIClassifier =  pf.make_pii_classifier(pf.languages.nl.make_lm());
    private endpoint_map:   Map<number, Tab> =  new Map<number, Tab>()

    constructor()
    {
        browser.tabs.onCreated.addListener((tab: Tabs.Tab) => {
            if (this.endpoint_map.has(tab.id))
                throw new Error('Tab already exists.')

            let last_focus:             {frame_id: number, valid: boolean} = {frame_id: null, valid: false};
            let last_valid_focus:       number;

            let next_text:              string;
            let tab_listener =  ((message: ICommonMessage, sender: Runtime.MessageSender): void => 
            {
                if (sender.tab.id === tab.id)
                {   // only accept messages from this tab
                    switch(message.type)
                    {
                        case ICommonMessage.Type.FOCUS: {
                            let f_message = (message as ICommonMessage.Focus);

                            if (last_focus.frame_id != null &&
                                last_focus.frame_id != sender.frameId)
                            {
                                browser.tabs.sendMessage(
                                    tab.id, 
                                    new ICommonMessage.Focus(false), 
                                    {frameId: last_focus.frame_id}
                                );
                            }

                            if (!f_message.valid)
                            {
                                browser.tabs.sendMessage(
                                    tab.id,
                                    new ICommonMessage.NotifyPII(
                                        0.0,
                                        [],
                                        true
                                    ),
                                    {frameId: 0}
                                );
                            }
                            else
                            {
                                last_valid_focus =  sender.frameId;
                            }

                            last_focus.frame_id =   sender.frameId;
                            last_focus.valid =      f_message.valid;
                            break;
                        }
                        case ICommonMessage.Type.REFOCUS: {
                            if (last_valid_focus != null)
                            {
                                browser.tabs.sendMessage(
                                    tab.id, 
                                    new ICommonMessage.Focus(true), 
                                    {frameId: last_valid_focus}
                                );

                                last_focus.frame_id =   last_valid_focus;
                                last_focus.valid =      true;
                            }
                            break;
                        }
                        // classify text
                        case ICommonMessage.Type.TEXT_ENTERED: {
                            next_text = (message as ICommonMessage.TextEntered).text;
                            let result = this.pii_filter.classify(next_text, WELL_FORMED_OVERRIDE);

                            if (sender.frameId != 0)
                            {
                                browser.tabs.sendMessage(
                                    tab.id,
                                    new ICommonMessage.NotifyPII(
                                        result.severity,
                                        result.pii,
                                        false
                                    ),
                                    {frameId: sender.frameId}
                                );
                                // send to main frame
                                browser.tabs.sendMessage(
                                    tab.id,
                                    new ICommonMessage.NotifyPII(
                                        result.severity,
                                        result.pii,
                                        true
                                    ),
                                    {frameId: 0}
                                );
                            }
                            else
                            {
                                // send to frame
                                browser.tabs.sendMessage(
                                    tab.id,
                                    new ICommonMessage.NotifyPII(
                                        result.severity,
                                        result.pii,
                                        false
                                    ),
                                    {frameId: 0}
                                );
                            }
                            break;
                        }
                        default: {
                            break;
                        }
                    };
                };
            });
            this.endpoint_map.set(tab.id, new Tab(tab_listener));
            browser.runtime.onMessage.addListener(tab_listener);
        });
        browser.tabs.onRemoved.addListener((tab_id: number, remove_info: Tabs.OnRemovedRemoveInfoType) => {
            if (this.endpoint_map.has(tab_id))
            {
                let tab: Tab = this.endpoint_map.get(tab_id);
                browser.runtime.onMessage.removeListener(tab.callback);
                this.endpoint_map.delete(tab_id);
            }
        });
    }
};

new PIIFilterService();  
browser.runtime.onInstalled.addListener((details: Runtime.OnInstalledDetailsType) => {
    browser.tabs.create({
        url: "assets/success.html"
    });
});