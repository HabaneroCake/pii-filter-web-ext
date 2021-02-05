import { AbstractHTMLTextEntryMirror } from './abstract-textentry-mirror';

/**
 * HTML textarea mirror which supports chrome and firefox, but clips chrome's viewport as if it were ff
 */
export class FirefoxTextAreaMirror extends AbstractHTMLTextEntryMirror
{
    protected mirror_div: HTMLDivElement;

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
    protected get_mirror_div(): HTMLDivElement
    {
        return this.mirror_div;
    }
    protected mirror_rect(left: number, top: number, width: number, height: number)
    {
        super.mirror_rect(left, top, width, height);

        const computed_style: CSSStyleDeclaration = window.getComputedStyle(this.input_element, "");
        this.get_mirror_div().style.width =    computed_style.width;
        this.get_mirror_div().style.height =   computed_style.height;
    }
    protected mirror_style(computed_style: CSSStyleDeclaration)
    {
        super.mirror_style(computed_style);
        // remove mirrored padding
        this.get_mirror_div().style.padding =               '0px';
        this.get_mirror_div().style.paddingLeft =           '0px';
        this.get_mirror_div().style.paddingRight =          '0px';
        this.get_mirror_div().style.paddingTop =            '0px';
        this.get_mirror_div().style.paddingBottom =         '0px';
        this.get_mirror_div().style.paddingBlockStart =     '0px';
        this.get_mirror_div().style.paddingBlockEnd =       '0px';
        this.get_mirror_div().style.paddingInlineStart =    '0px';
        this.get_mirror_div().style.paddingInlineEnd =      '0px';
        // simulate "viewport" padding
        this.div.style.paddingTop =                         computed_style.paddingTop;
        this.div.style.paddingBottom =                      computed_style.paddingBottom;
        this.div.style.paddingBlockStart =                  computed_style.paddingBlockStart;
        this.div.style.paddingBlockEnd =                    computed_style.paddingBlockEnd;
        this.div.style.paddingInlineStart =                 computed_style.paddingInlineStart;
        this.div.style.paddingInlineEnd =                   computed_style.paddingInlineEnd;
        this.div.style.paddingLeft =                        computed_style.paddingLeft;
        this.div.style.paddingRight =                       computed_style.paddingRight;
    }
};