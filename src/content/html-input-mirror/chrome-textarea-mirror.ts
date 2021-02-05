import { AbstractHTMLTextEntryMirror } from './abstract-textentry-mirror';

/**
 * HTML textarea mirror which supports chrome, but doesn't respect Firefox's viewport padding
 */
export class ChromeTextAreaMirror extends AbstractHTMLTextEntryMirror
{
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
        this.init();
    }
    protected mirror_rect(left: number, top: number, width: number, height: number)
    {
        super.mirror_rect(left, top, width, height);
        this.get_mirror_div().style.width =   `${ width }px`;
        this.get_mirror_div().style.height =  `${ height }px`;
    }

    protected get_mirror_div(): HTMLDivElement
    {
        return this.div;
    }
};