import { AbstractHTMLTextAreaMirror } from './abstract-textarea-mirror';
import { Rect } from '../../common/rect';

/**
 * HTML textarea mirror which supports chrome and firefox, but clips chrome's viewport as if it were ff
 */
export class FirefoxTextAreaMirror extends AbstractHTMLTextAreaMirror
{
    protected mirror_div:   HTMLDivElement;
    constructor(
        document: Document,
        input_element: HTMLTextAreaElement,
        rect_polling_interval?: number
    ) {
        super(
            document,
            input_element,
            rect_polling_interval
        );
        // add rect for simulating ff padding
        this.mirror_div = this.document.createElement("div");
        this.div.appendChild(this.mirror_div);
        this.init();
    }
    protected get_viewport(): Rect
    {
        return Rect.from_element(this.mirror_div);
    }
    protected get_mirror_div(): HTMLDivElement
    {
        return this.mirror_div;
    }
    protected mirror_scroll(scrollLeft: number, scrollTop: number)
    {
        this.mirror_div.scrollLeft =    scrollLeft;
        this.mirror_div.scrollTop =     scrollTop;
    }
    protected mirror_rect(rect: Rect)
    {
        this.div.style.left =           `${ rect.left_absolute }px`;
        this.div.style.top =            `${ rect.top_absolute }px`;
        
        // TODO: can this be solved with boxSizing?
        const computed_style: CSSStyleDeclaration = window.getComputedStyle(this.input_element, "");
        this.mirror_div.style.width =   computed_style.width; //this.input_element.scrollWidth
        this.mirror_div.style.height =  computed_style.height; //this.input_element.scrollHeight
    }
    protected mirror_style(computed_style: CSSStyleDeclaration)
    {
        super.mirror_style(computed_style);
        // remove mirrored padding
        this.mirror_div.style.padding =             '0px';
        this.mirror_div.style.paddingLeft =         '0px';
        this.mirror_div.style.paddingRight =        '0px';
        this.mirror_div.style.paddingTop =          '0px';
        this.mirror_div.style.paddingBottom =       '0px';
        this.mirror_div.style.paddingBlockStart =   '0px';
        this.mirror_div.style.paddingBlockEnd =     '0px';
        this.mirror_div.style.paddingInlineStart =  '0px';
        this.mirror_div.style.paddingInlineEnd =    '0px';
        // simulate "viewport" padding
        this.div.style.paddingTop =                 computed_style.paddingTop;
        this.div.style.paddingBottom =              computed_style.paddingBottom;
        this.div.style.paddingBlockStart =          computed_style.paddingBlockStart;
        this.div.style.paddingBlockEnd =            computed_style.paddingBlockEnd;
        this.div.style.paddingInlineStart =         computed_style.paddingInlineStart;
        this.div.style.paddingInlineEnd =           computed_style.paddingInlineEnd;
        this.div.style.paddingLeft =                computed_style.paddingLeft;
        this.div.style.paddingRight =               computed_style.paddingRight;
        // TODO: for mirror div as well?
        this.div.style.boxSizing =                  'border-box'
    }
};