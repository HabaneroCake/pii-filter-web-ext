import { Bindings } from '../bindings';
import { HighlightTextAreaSource } from './text-entry-sources/text-area';
import { HighlightContentParser, Highlighter, HighlightTextEntrySource } from './highlighter';

export class TextEntryHighlighter
{
    protected bindings: Bindings = new Bindings();
    protected source:   HighlightTextEntrySource;
    protected root_div: HTMLDivElement;
    protected shadow:   ShadowRoot;

    constructor(
        protected document: Document,
        protected highlighter: Highlighter,
        protected content_parser: HighlightContentParser
    )
    {
        // bind highlighter and content parser
        this.content_parser.set_highlighter(highlighter);
        
        // create shadow
        this.root_div = this.document.createElement("div");
        this.shadow =  this.root_div.attachShadow({mode: 'open'});
        document.body.firstElementChild.insertAdjacentElement('beforebegin', this.root_div);

        // catch focus
        this.bindings.bind_event(document, 'focusin', (event: Event) => {
            const target_element: HTMLElement = event.target as HTMLElement;

            // delete old interface
            if (this.source != null)
                this.source.remove();

            const polling_interval: number = 5000;

            const add_interface = (event: Event) => {
                target_element.removeEventListener('mouseup', add_interface);
                target_element.removeEventListener('keyup', add_interface);

                if (target_element.nodeName == 'INPUT')
                    return // TODO
                else if (target_element.nodeName == 'TEXTAREA')
                    this.source = new HighlightTextAreaSource(target_element, polling_interval);
                else if (target_element.isContentEditable)
                    return // TODO
                else
                    return;

                // bind interface removal
                for (let event_name of ['blur', 'focusout'])
                {
                    const on_blur = (event: Event) => {
                        this.remove_source();
                        target_element.removeEventListener(event_name, on_blur);
                    };
                    target_element.addEventListener(event_name, on_blur);
                }

                // initialize
                this.source.init(
                    this.document,
                    this.shadow,
                    this.content_parser,
                    this.highlighter
                );
                this.highlighter.set_text_entry_source(this.source);
                this.content_parser.set_text_entry_source(this.source);
                console.log('bound');
            };
            target_element.addEventListener('mouseup', add_interface);
            target_element.addEventListener('keyup', add_interface);
        });
    }

    public remove_source()
    {
        if (this.source != null)
        {
            this.source.remove();
            this.source = null;
            this.highlighter.set_text_entry_source(this.source);
            this.content_parser.set_text_entry_source(this.source);
            console.log('released');
        }
    }

    public remove()
    {
        this.bindings.remove();
    }
};