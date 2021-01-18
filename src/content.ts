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
        protected input_focus_manager:  DOMFocusManager =       new DOMFocusManager(document);
        protected active_element_:      HTMLInputElement;
        protected last_active_element:  HTMLInputElement;

        constructor()
        {
            // Listen to focus changes in other frames
            browser.runtime.onMessage.addListener((message: ICommonMessage, sender: Runtime.MessageSender) => {
                switch(message.type) {
                    case ICommonMessage.Type.FOCUS: {
                        let f_event = message as ICommonMessage.Focus;
                        if (!f_event.valid && this.active_element != null)
                        {
                            this.active_element.removeEventListener(
                                'input',
                                this.text_input_listener.bind(this)
                            );
                            this.active_element = null;
                            this.input_focus_manager.unfocus();
                        }
                        else if (f_event.valid && this.active_element == null && this.last_active_element != null)
                        {   // restore focus
                            this.last_active_element.focus()
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
                    this.active_element = element as HTMLInputElement;
                    // send initial focus
                    browser.runtime.sendMessage(null,
                        new ICommonMessage.TextEntered(this.active_element.value)
                    );
                    this.active_element.addEventListener('input', this.text_input_listener.bind(this));
                    browser.runtime.sendMessage(null, new ICommonMessage.Focus(true));
                }
                else 
                {
                    browser.runtime.sendMessage(null, new ICommonMessage.Focus(false));
                    this.active_element = null;
                }
            });
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
        /**
         * callback for text input
         * @param event not used
         */
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
        // private highlighted_element:    DOMRectHighlight = null; // (removed rect sum before dev e0f18b0, clarity)
        // tags an element with an overlay to provide info to the user
        private info_overlay:           DOMElementInfoOverlay = null;
        constructor()
        {
            super();
            browser.runtime.onMessage.addListener((message: ICommonMessage, sender: Runtime.MessageSender) => {
                switch(message.type) {
                    case ICommonMessage.Type.NOTIFY_PII: {
                        let n_message = message as ICommonMessage.NotifyPII;
                        this.update_overlay(n_message.severity_mapping, n_message.pii);
                        break;
                    }
                    case ICommonMessage.Type.NOTIFY_PII_PARSING: {
                        this.info_overlay.restart_fade_out_timer();
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
        }

        private update_overlay(severity: number = this.info_overlay.severity, pii?: Array<[string[], number?, number?]>)
        {
            if (this.info_overlay == null)
            {
                this.info_overlay = new DOMElementInfoOverlay(document);
                this.info_overlay.on_focus_required.observe((req: boolean) => {
                    browser.runtime.sendMessage(null, new ICommonMessage.Refocus());
                });
            }
            
            this.info_overlay.severity = severity;

            if (pii != null)
                this.info_overlay.pii = pii;
        }
    };

    export class Content{private frame: Frame = (window.self !== window.top) ? new Frame() : new Top();};
};

new PII_Filter.Content();