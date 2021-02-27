import { browser, Runtime, Storage } from 'webextension-polyfill-ts';
import { PIIFilterInfoOverlay } from './content/pii-filter-info-overlay';
import { ICommonMessage } from './common/common-messages';
import { DOMFocusManager } from './content/dom-focus-manager';
import { Utils } from './content/utils';

import { RangeHighlighter } from './content/text-entry-highlighter/range-highlighter';
import { BoxHighlightContentParser } from './content/text-entry-highlighter/box-highlight-content-parser';
import { TextEntryHighlighter } from './content/text-entry-highlighter/text-entry-highlighter';
import { BoxIntensityRange } from './content/text-entry-highlighter/box-highlight-range';

function listen_settings_changed(on_activate: ()=>void, on_pause: ()=>void)
{
    // Get settings at start
    browser.storage.sync.get("active").then(
        (result: { [s: string]: any; }) => {
            (result.active || false)? on_activate() : on_pause();
        }, 
        (error)=>console.log(`Error: ${error}`)
    );

    // Listen to main settings changes
    browser.storage.onChanged.addListener(
        (changes: { [s: string]: Storage.StorageChange; }, area_name: string) => {
            let active: boolean = false;
            let changed_items = Object.keys(changes);
            if (changed_items.includes('active'))
                active = changes['active'].newValue;
            if (active)
                on_activate();
            else
                on_pause();
        }
    );
}

namespace PII_Filter
{
    export class Frame
    {
        protected input_focus_manager:      DOMFocusManager =           new DOMFocusManager(document);
        protected initialized:              boolean =                   false;
        protected active_element_:          HTMLInputElement;
        protected last_active_element:      HTMLInputElement;

        protected highlighter:              RangeHighlighter;
        protected content_parser:           BoxHighlightContentParser;
        protected text_entry_highlighter:   TextEntryHighlighter;
        protected resolver:                 (ranges: Array<BoxIntensityRange>) => void;

        protected is_active:                boolean = false;

        constructor()
        {
            listen_settings_changed(
                () => {
                    this.is_active = true;
                    this.activate();
                },
                () => {
                    this.is_active = false;
                    this.highlighter.clear();
                    this.pause();
                }
            );
            // Listen to focus changes in other frames
            browser.runtime.onMessage.addListener((message: ICommonMessage, sender: Runtime.MessageSender) => {
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
                    case ICommonMessage.Type.NOTIFY_PII:
                    {
                        let n_message = message as ICommonMessage.NotifyPII;
                        this.handle_pii(n_message);
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });

            // highlighting and input
            this.highlighter = new RangeHighlighter();
            this.content_parser = new BoxHighlightContentParser(
                (text: string, resolver: (ranges: Array<BoxIntensityRange>) => void) => 
                {
                    if (this.resolver == null && this.is_active)
                    {
                        this.resolver = resolver;
                        browser.runtime.sendMessage(null,
                            new ICommonMessage.TextEntered(text)
                        );
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
        protected async handle_pii(message: ICommonMessage.NotifyPII)
        {
            if (!message.ignore_highlight)
            {
                let ranges: Array<BoxIntensityRange> = new Array<BoxIntensityRange>();
                if (this.is_active)
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
            browser.runtime.onMessage.addListener((message: ICommonMessage, sender: Runtime.MessageSender) => {
                switch(message.type) {
                    case ICommonMessage.Type.NOTIFY_PII_PARSING: {
                        this.info_overlay.restart_fade_out_timer();
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
            // info overlay
            this.info_overlay = new PIIFilterInfoOverlay(document);
            this.info_overlay.on_focus_required.observe((req: boolean) => {
                browser.runtime.sendMessage(null, new ICommonMessage.Refocus());
            });
        }

        protected async handle_pii(message: ICommonMessage.NotifyPII)
        {
            super.handle_pii(message);
            
            if (this.is_active)
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

    export class Content{private frame: Frame = (window.self !== window.top) ? new Frame() : new Top();};
};

new PII_Filter.Content();