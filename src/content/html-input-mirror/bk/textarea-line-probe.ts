import { ShadowDomDiv } from '../shadow-dom-div';
import { textarea_apply_css } from './textarea-apply-css';
import { Rect } from '../../common/rect';
// imagine this currently only works for ltr if it even ends up working

/**
 * Heavy hack that probes a copy of the supplied textarea for the content of each line.
 * @param textarea the textarea to probe
 * @param document the document to use
 */

 // this is an (async) solution for oddities which exist with chrome textarea

export class TextAreaLineProbe extends ShadowDomDiv
{
    protected cloned_textarea: HTMLElement

    constructor(
        protected textarea: HTMLTextAreaElement,
        document: Document
    )
    {
        super(document);
        
        // create a textarea, stylize it according to the original (or have funcs for this)

        this.cloned_textarea = document.createElement('span');

        // clone textarea into a documentFragment
        // const range: Range = document.createRange(); range.selectNode(this.textarea);
        // this.cloned_textarea = range.cloneContents().firstChild as HTMLTextAreaElement;

        // make textarea height 0
        // this.cloned_textarea.style.height = '0px';

        this.div.appendChild(this.cloned_textarea);
        this.div.style.visibility = 'visible';
    }
    public set_width(width: number)
    {
        this.cloned_textarea.style.top = `${1500}px`;
        this.cloned_textarea.style.left = `${150}px`;
        this.cloned_textarea.style.width = `${width + 1}px`;
    }
    public set_css(style: CSSStyleDeclaration)
    {
        textarea_apply_css(this.cloned_textarea, style);
        // make textarea height 0
        // this.cloned_textarea.style.height = '0px';
        this.cloned_textarea.style.display = 'block';
        this.cloned_textarea.style.overflow = 'hidden';
        this.cloned_textarea.style.boxSizing = 'border-box';
        // this.cloned_textarea.style.columnCount = 'initial !important;';
    }
    public probe(): Array<string>
    {
        this.cloned_textarea.textContent = this.textarea.value;
        return [];
    //     const original_text: string = this.textarea.value;
    //     let lines: Array<string> = new Array<string>();
    //     if (original_text.length == 0)
    //         return lines;

    //     // char index
    //     let i: number = 0;

    //     if (this.cloned_textarea.style.height == this.cloned_textarea.style.height)
    //         this.cloned_textarea.style.overflowY = 'hidden';

    //     // add first char
    //     this.cloned_textarea.value = original_text[i++];

    //     // store starting height
    //     let last_scroll_height: number = this.cloned_textarea.scrollHeight;

    //     const add_char_to_back = () => {
    //         if (i < original_text.length)
    //             this.cloned_textarea.value += original_text[i];
    //         else
    //             this.cloned_textarea.value += '_';
    //     };

    //     const remove_char_from_front = () => {
    //         this.cloned_textarea.value = this.cloned_textarea.value.substring(1, this.cloned_textarea.value.length);
    //     };

    //     const remove_char_from_back = () => {
    //         this.cloned_textarea.value = this.cloned_textarea.value.substring(0, this.cloned_textarea.value.length-1);
    //     };

    //     const height_changed = (): boolean => {
    //         // console.log(this.cloned_textarea.scrollHeight, last_scroll_height)
    //         if (this.cloned_textarea.scrollHeight != last_scroll_height)
    //         {
    //             // store new height
    //             last_scroll_height = this.cloned_textarea.scrollHeight;
    //             return true;
    //         }
    //         return false;;
    //     }
        
    //     let segment_start_index:    number = 0;
    //     let segment_end_index:      number = 0;
    //     // iterate over characters
    //     for (i; i < original_text.length; ++i)
    //     {
    //         // 1. add char
    //         add_char_to_back();

    //         // if newline is encountered
    //         if (height_changed())
    //         {
    //             // 2. add more chars (or underscore padding if end is reached) until newline
    //             do {
    //                 i++;
    //                 add_char_to_back();
    //             } while (!height_changed())
    //             // stop before newline
    //             i--;
    //             remove_char_from_back();
    //             last_scroll_height = this.cloned_textarea.scrollHeight;
    //             // 3. remove characters from front of string until newline is removed
    //             do {
    //                 remove_char_from_front();
    //                 // increment end index counter
    //                 segment_end_index++;
    //             } while (!height_changed())
    //             // store line
    //             lines.push(original_text.substring(segment_start_index, Math.min(segment_end_index, original_text.length)));
    //             // store last segment start index
    //             segment_start_index = segment_end_index;
    //         }
    //         // 5. go back to 1
    //     }
    //     // 6 add last line
    //     if (segment_start_index < original_text.length)
    //         lines.push(original_text.substring(segment_start_index, original_text.length));

    //     return lines;
    }
};