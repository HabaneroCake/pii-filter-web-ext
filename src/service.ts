import { browser, Tabs, Runtime, WebNavigation } from 'webextension-polyfill-ts';
import { PIIFilter, NL } from "pii-filter";
import { IMessage } from './common/message';
import { ICommonMessage } from './common/common-messages';

// TODO: check if window close event automatically calls tabs.onRemoved

type message_callback = (message: IMessage, sender: Runtime.MessageSender) => void;
class FrameIdentifier{constructor(public frame_id: number, public url: string){}};
class Tab {constructor(public callback: message_callback){}};

export class PIIFilterService
{
    private pii_filter:     PIIFilter =         new PIIFilter(new NL());
    private active:         boolean =           true;
    private endpoint_map:   Map<number, Tab> =  new Map<number, Tab>()
    constructor()
    {
        console.log('start tabmanager');
        browser.tabs.onCreated.addListener((tab: Tabs.Tab) => {
            if (this.endpoint_map.has(tab.id))
                throw new Error('Tab already exists.')

            let last_focus: {frame_id: number, valid: boolean};
            let frame_parents: Map<number, FrameIdentifier> = new Map<number, FrameIdentifier>();
            let tab_listener = ((message: IMessage, sender: Runtime.MessageSender): void => {
                console.log(message, sender)
                console.log(sender.tab.id, tab.id)
                if (sender.tab.id === tab.id)
                {   // only accept messages from this tab
                    switch(message.type)
                    {   // register and forward frames
                        case IMessage.Types.REGISTER: {
                            console.log('register event', message, sender);
                            console.log(frame_parents);
                            if (frame_parents.has(sender.frameId))
                                throw new Error('Frame id already exists');
                            if (sender.frameId != 0)
                            {   // this is an iframe, find the parent frame
                                console.log('register event0');
                                console.log(browser.webNavigation.getAllFrames);

                                let loc_frame: WebNavigation.GetAllFramesCallbackDetailsItemType;
                                browser.webNavigation.getAllFrames({tabId: tab.id}).then(
                                    (frames: WebNavigation.GetAllFramesCallbackDetailsItemType[]) => {
                                        for (let frame of frames)
                                        {
                                            if (frame.frameId == sender.frameId)
                                            {
                                                loc_frame = frame;
                                                break;
                                            }
                                        }
                                        if (!loc_frame)
                                        throw new Error(`Could not find parent frame for: ${ sender.frameId }`);
                                        // set the corresponding value    
                                        // TODO could remove url and change back again
                                        frame_parents.set(sender.frameId, new FrameIdentifier(
                                            loc_frame.parentFrameId,
                                            loc_frame.url
                                        ));
                                        console.log('update frprens', frame_parents);
                                    },
                                    (reason: any) => {
                                        throw new Error(`Could not retrieve frames: ${ reason }`);
                                    }
                                )
                            }
                            break;
                        }
                        case IMessage.Types.BUBBLE_EVENT: {
                            let n_message = (message as IMessage.BubbleEvent);
                            if (!n_message.original_sender)
                                n_message.original_sender = sender.frameId;

                            if (sender.frameId !== 0)
                            {
                                if (!frame_parents.has(sender.frameId))
                                    throw new Error(`Could not find parent mapping for: ${ sender.frameId }`);

                                n_message.url = frame_parents.get(sender.frameId).url;
                                browser.tabs.sendMessage(tab.id, message, {frameId: frame_parents.get(sender.frameId).frame_id});
                            }
                            else
                            {
                                switch (n_message.event.type)
                                {
                                    case ICommonMessage.Type.FOCUS: {
                                        let f_message = n_message.event as ICommonMessage.Focus;
                                        if (last_focus.valid && !f_message.valid &&
                                            last_focus.frame_id != n_message.original_sender)
                                        {
                                            browser.tabs.sendMessage(
                                                tab.id, 
                                                new IMessage.DirectedEvent(f_message), 
                                                {frameId: last_focus.frame_id}
                                            );
                                        }
                                        last_focus.frame_id = n_message.original_sender;
                                        last_focus.valid = f_message.valid;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                                // Send original message back to top frame
                                browser.tabs.sendMessage(
                                    tab.id, 
                                    new IMessage.TopEvent(n_message.event), 
                                    {frameId: 0}
                                );
                            }
                            break;
                        }
                        // classify text
                        case IMessage.Types.TEXT_ENTERED:
                            if (this.active)
                            {
                                let result = this.pii_filter.classify((message as IMessage.TextEntered).text);
                                let all_pii = result.pii();
                                let pii_strings: Array<string> = new Array<string>();

                                for (let pii of all_pii)
                                    pii_strings.push(`${pii.classification.classifier.name.replace('_', ' ')}: ${pii.text}`);

                                browser.tabs.sendMessage(
                                    tab.id,
                                    new IMessage.NotifyPII(
                                        result.severity_mapping,
                                        pii_strings
                                    ),
                                    {frameId: 0}
                                );
                            }
                            break;
                        default: {
                            break;
                        }
                    };
                };
            });
            console.log(tab_listener)
            browser.runtime.onMessage.addListener(tab_listener);
            this.endpoint_map.set(tab.id, new Tab(tab_listener));
            console.log('added tab')
        });
        browser.tabs.onRemoved.addListener((tab_id: number, remove_info: Tabs.OnRemovedRemoveInfoType) => {
            if (this.endpoint_map.has(tab_id))
            {
                console.log('remove tab')
                browser.runtime.onMessage.removeListener(this.endpoint_map.get(tab_id).callback);
                this.endpoint_map.delete(tab_id);
            }
        });
    }
};

new PIIFilterService();