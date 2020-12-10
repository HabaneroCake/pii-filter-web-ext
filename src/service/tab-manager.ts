import { browser, Tabs, Runtime, WebNavigation } from 'webextension-polyfill-ts';
import { IMessage } from '../common/message';

// TODO: check if window close event automatically calls tabs.onRemoved

type message_callback = (message: IMessage, sender: Runtime.MessageSender) => void;
class frame_identifier{constructor(public frame_id: number, public url: string){}};
class Tab {constructor(public callback: message_callback){}};

export class TabManager
{
    // TODO might be able to change back to callback
    private endpoint_map: Map<number, Tab> = new Map<number, Tab>()
    constructor()
    {
        console.log('start tabmanager');
        browser.tabs.onCreated.addListener((tab: Tabs.Tab) => {
            if (this.endpoint_map.has(tab.id))
                throw new Error('Tab already exists.')

            let frame_parents: Map<number, frame_identifier> = new Map<number, frame_identifier>();
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
                                        frame_parents.set(sender.frameId, new frame_identifier(
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
                        // TODO: store sender.frameId in let var
                        case IMessage.Types.BUBBLE_EVENT: {
                            console.log('bubble event', message, sender);
                            if (sender.frameId !== 0)
                            {
                                console.log('bubble event1', frame_parents);
                                if (!frame_parents.has(sender.frameId))
                                    throw new Error(`Could not find parent mapping for: ${ sender.frameId }`);
                                
                                (message as IMessage.BubbleEvent).url = frame_parents.get(sender.frameId).url;
                                console.log('bubble event2', message, sender);
                                browser.tabs.sendMessage(tab.id, message, {frameId: frame_parents.get(sender.frameId).frame_id});
                            }
                            else
                            {   // Send original message back to top frame
                                console.log('post top', message);
                                browser.tabs.sendMessage(
                                    tab.id, 
                                    new IMessage.TopEvent(
                                    (message as IMessage.BubbleEvent).event), 
                                    {frameId: 0});
                            }
                            break;
                        }
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