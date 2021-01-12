import { browser, Runtime } from 'webextension-polyfill-ts';
import { DOMRectHighlight } from './content/dom-rect-highlight';
import { DOMElementInfoOverlay } from './content/dom-element-info-overlay';
import { ICommonMessage } from './common/common-messages';
import { DOMFocusManager } from './content/dom-focus-manager';
import { Utils } from './content/utils';

namespace PII_Filter
{
    export class Frame
    {
        protected input_focus_manager:  DOMFocusManager = new DOMFocusManager(document);
        protected active_element:       HTMLInputElement;

        constructor()
        {
            browser.runtime.onMessage.addListener((message: ICommonMessage, sender: Runtime.MessageSender) => {
                switch(message.type) {
                    case ICommonMessage.Type.FOCUS: {
                        let f_event = message as ICommonMessage.Focus;
                        if (!f_event.valid && this.active_element)
                        {
                            this.active_element.removeEventListener(
                                'input',
                                this.text_input_listener.bind(this)
                            );
                            this.active_element = null;
                            this.input_focus_manager.unfocus();
                        }
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
            // Register input management
            this.input_focus_manager.active_focus.observe((element: HTMLElement) => {
                let is_text_input: boolean = element != null && Utils.DOM.is_text_input(element);
                
                if (this.active_element != null)
                    this.active_element.removeEventListener('input', this.text_input_listener.bind(this));

                if (is_text_input)
                {
                    // send initial focus
                    browser.runtime.sendMessage(null,
                        new ICommonMessage.TextEntered((element as HTMLInputElement).value)
                    );
                    element.addEventListener('input', this.text_input_listener.bind(this));
                    browser.runtime.sendMessage(null, new ICommonMessage.Focus(true));
                    this.active_element = element as HTMLInputElement;
                }
                else if (this.active_element != null)
                {
                    browser.runtime.sendMessage(null, new ICommonMessage.Focus(false));
                    this.active_element = null;
                }
                else
                    browser.runtime.sendMessage(null, new ICommonMessage.Focus(false));
            });
        }

        private text_input_listener(event: Event)
        {
            if (this.active_element != null)
                browser.runtime.sendMessage(null,
                    new ICommonMessage.TextEntered(this.active_element.value)
                );
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
            browser.runtime.onMessage.addListener((message: ICommonMessage, sender: Runtime.MessageSender) => {
                switch(message.type) {
                    case ICommonMessage.Type.NOTIFY_PII: {
                        let n_message = message as ICommonMessage.NotifyPII;
                        if (!this.info_overlay)
                            this.info_overlay = new DOMElementInfoOverlay(document);

                        this.info_overlay.severity =    n_message.severity_mapping;
                        this.info_overlay.pii =         n_message.pii;

                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
        }
    };

    export class Content{private frame: Frame = (window.self !== window.top) ? new Frame() : new Top();};
};

new PII_Filter.Content();