import { browser, Runtime } from 'webextension-polyfill-ts';
import { DOMInputFocusManager } from './content/dom-input-focus-manager';
import { DOMRectHighlight } from './content/dom-rect-highlight';
import { DOMElementInfoOverlay } from './content/dom-element-info-overlay';
import { Utils } from './content/utils';
import { ICommonMessage } from './common/common-messages';
import { IMessage } from './common/message';

namespace PII_Filter
{
    export class Frame
    {
        // watches input focus
        protected input_focus_manager:  DOMInputFocusManager = new DOMInputFocusManager(document)

        constructor()
        {
            console.log('create frame');
            browser.runtime.onMessage.addListener((message: IMessage, sender: Runtime.MessageSender) => {
                console.log(message);
                switch(message.type) {
                    case IMessage.Types.DIRECTED_EVENT: {
                        let n_message = message as IMessage.DirectedEvent;
                        switch (n_message.event.type)
                        {
                            case ICommonMessage.Type.FOCUS: {
                                let f_event = n_message.event as ICommonMessage.Focus;
                                if (!f_event.valid)
                                {
                                }
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                        break;
                    }
                    case IMessage.Types.BUBBLE_EVENT: {
                        // console.log('bubble event', message);
                        let n_message = message as IMessage.BubbleEvent;
                        
                        let port_iframe: HTMLIFrameElement;
                        for (let iframe of Array.from(document.getElementsByTagName('iframe'))) {
                            console.log(n_message.url, iframe.src);
                            if (iframe.src === n_message.url)
                            {
                                port_iframe = iframe;
                                break;
                            }
                        };
                        if (!port_iframe)
                            throw new Error('Could not find iframe.');

                        switch (n_message.event.type)
                        {
                            case ICommonMessage.Type.FOCUS: {
                                let f_event =           n_message.event as ICommonMessage.Focus;
                                let iframe_rect =       Utils.DOM.absolute_rect(port_iframe);

                                // let margins =           Utils.DOM.StylingMargins.calculate_all(port_iframe);

                                f_event.rect.left +=    document.documentElement.scrollLeft +   iframe_rect.left;// - margins.left;
                                f_event.rect.top +=     document.documentElement.scrollTop +    iframe_rect.top;// - margins.top;

                                browser.runtime.sendMessage(null, message);
                                break;
                            }
                            default: {
                                break;
                            }
                            break;
                        }
                    }
                    default: {
                        break;
                    }
                }
            });
            console.log('send register');
            // register this content script
            browser.runtime.sendMessage(null, new IMessage.Register());
            console.log('observe input');
            // Register input management
            this.input_focus_manager.active_focus.observe((element: HTMLElement) => {
                if (element)
                {
                    // send initial click
                    browser.runtime.sendMessage(null,
                        new IMessage.TextEntered((element as HTMLInputElement).value)
                    );
                    // register input listener TODO: unregister
                    element.addEventListener('input', (event: Event) => {
                        browser.runtime.sendMessage(null,
                            new IMessage.TextEntered((element as HTMLInputElement).value)
                        );
                    });
                    browser.runtime.sendMessage(null,
                        new IMessage.BubbleEvent(
                            new ICommonMessage.Focus(
                                element !== null,
                                Utils.DOM.absolute_rect(element)
                            )
                        )
                    );
                }
                else
                {
                    browser.runtime.sendMessage(null,
                        new IMessage.BubbleEvent(new ICommonMessage.Focus(false)));
                }
            });
            console.log('done init');
        }
    };

    /**
     * Top level frame (for drawing overlays)
     */
    export class Top extends Frame
    {
        // provides an overlay to get user's attention
        private highlighted_element:    DOMRectHighlight =      null;
        // tags an element with an overlay to provide info to the user
        private info_overlay:           DOMElementInfoOverlay = null;

        constructor()
        {
            super();
            console.log('start Top');
            browser.runtime.onMessage.addListener((message: IMessage, sender: Runtime.MessageSender) => {
                switch(message.type) {
                    case IMessage.Types.TOP_EVENT: {
                        console.log('top event', message);
                        let n_message = message as IMessage.TopEvent;
                        switch (n_message.event.type)
                        {
                            case ICommonMessage.Type.FOCUS: {
                                let f_event = n_message.event as ICommonMessage.Focus;
                                if (!f_event.valid)
                                {
                                    this.info_overlay.severity = 0.0;
                                    this.info_overlay.pii = [];
                                }
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                        break;
                    }
                    case IMessage.Types.NOTIFY_PII: {
                        let n_message = message as IMessage.NotifyPII;
                        if (!this.info_overlay)
                            this.info_overlay = new DOMElementInfoOverlay(document);

                        this.info_overlay.severity = n_message.severity_mapping;
                        this.info_overlay.pii = n_message.pii;

                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
            console.log('done init 2');
        }
    };

    export class Content{private frame: Frame = (window.self !== window.top) ? new Frame() : new Top();};
};

new PII_Filter.Content();