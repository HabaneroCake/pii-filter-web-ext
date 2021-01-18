import { browser, Tabs, Runtime, WebNavigation } from 'webextension-polyfill-ts';
import { PIIFilter, NL } from "pii-filter";
import { ICommonMessage } from './common/common-messages';

// TODO: check if window close event automatically calls tabs.onRemoved

type message_callback = (message: ICommonMessage, sender: Runtime.MessageSender) => void;
class Tab {constructor(public callback: message_callback){}};

export class PIIFilterService
{
    private pii_filter:     PIIFilter =         new PIIFilter(new NL());
    private active:         boolean =           true; // will be part of settings
    private endpoint_map:   Map<number, Tab> =  new Map<number, Tab>()
    constructor()
    {
        function get_dutch_name(classifier_name: string)
        {
            switch (classifier_name)
            {
                case 'first_name':
                    return 'Voornaam';
                case 'family_name':
                    return 'Achternaam';
                case 'phone_number':
                    return 'Telefoonnummer';
                case 'medicine_name':
                    return 'Medicijnnaam';
                case 'pet_name':
                    return 'Huisdiernaam';
                case 'email_address':
                    return 'E-mail adres';
                case 'date':
                    return 'Datum';
                default:
                    return 'Niet Herkend'
            }
        }
        browser.tabs.onCreated.addListener((tab: Tabs.Tab) => {
            if (this.endpoint_map.has(tab.id))
                throw new Error('Tab already exists.')

            let last_focus:             {frame_id: number, valid: boolean} = {frame_id: null, valid: false};
            let last_valid_focus:       number;
            let last_pii_str:           string = null;
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
                                last_pii_str = null;
                                browser.tabs.sendMessage(
                                    tab.id,
                                    new ICommonMessage.NotifyPII(
                                        0.0,
                                        []
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
                        case ICommonMessage.Type.TEXT_ENTERED:
                            if (this.active)
                            {
                                let result = this.pii_filter.classify((message as ICommonMessage.TextEntered).text);
                                let all_pii = result.pii();
                                let pii_strings: Array<[Array<string>, number?, number?]> = [
                                    [new Array('Informatietype', 'Waarde')]
                                ];

                                let full_pii_str: string = '';
                                for (let pii of all_pii)
                                {
                                    let classifier_name: string = get_dutch_name(pii.classification.classifier.name);
                                    pii_strings.push([[classifier_name, pii.text],
                                            pii.classification.score, pii.classification.severity]);

                                    full_pii_str += pii.text;
                                }

                                if (last_pii_str != full_pii_str)
                                {
                                    browser.tabs.sendMessage(
                                        tab.id,
                                        new ICommonMessage.NotifyPII(
                                            result.severity_mapping,
                                            pii_strings
                                        ),
                                        {frameId: 0}
                                    );

                                    last_pii_str = full_pii_str;
                                }
                                else
                                {
                                    browser.tabs.sendMessage(
                                        tab.id,
                                        new ICommonMessage.NotifyPIIParsing(),
                                        {frameId: 0}
                                    );
                                }
                            }
                            break;
                        default: {
                            break;
                        }
                    };
                };
            });
            browser.runtime.onMessage.addListener(tab_listener);
            this.endpoint_map.set(tab.id, new Tab(tab_listener));
        });
        browser.tabs.onRemoved.addListener((tab_id: number, remove_info: Tabs.OnRemovedRemoveInfoType) => {
            if (this.endpoint_map.has(tab_id))
            {
                browser.runtime.onMessage.removeListener(this.endpoint_map.get(tab_id).callback);
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