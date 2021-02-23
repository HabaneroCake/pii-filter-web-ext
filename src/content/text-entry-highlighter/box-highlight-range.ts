import {
    Highlighter, HighlightRange,
} from './highlighter'

import { calc_array_diff } from '../../common/array-diff';
import { DocHighlight } from './highlighter';
import { Rect } from '../../common/rect';

export interface BoxIntensityRange extends HighlightRange
{
    intensity: number
};

export class BoxHighlightRange implements DocHighlight
{
    protected divs_container:     HTMLDivElement;
    protected divs:         Array<HTMLDivElement> = new Array<HTMLDivElement>();
    protected _color:       [number, number, number, number];
    protected containers:   [Node, Node];
    protected range_adjusted: boolean = false;
    current_range:          BoxIntensityRange;
    

    constructor(
        range: BoxIntensityRange,
        protected _document_range: Range,
    )
    {
        this.update_range(range);
    }
    get document_range()
    {
        if (this.range_adjusted)
        {
            this._document_range.setStart(
                this.containers[0] || this._document_range.startContainer,
                this.current_range.start
            );
            this._document_range.setEnd(
                this.containers[1] || this._document_range.endContainer,
                this.current_range.end
            );
            this.range_adjusted = false;
        }
        return this._document_range;
    }
    update_range(range: HighlightRange): void
    {
        this.current_range = range as BoxIntensityRange;
        this.color = [255, 0, 0, 0.1 + this.current_range.intensity * 0.65];
    }
    adjust_range(
        start: number=this.current_range.start,
        end: number=this.current_range.end,
        start_container: Node=this.document_range.endContainer,
        end_container: Node=this.document_range.endContainer
    ): void
    {   // TODO (cb?)
        this.current_range.start = start;
        this.current_range.end = end;
        this.containers = [start_container, end_container];
        this.range_adjusted = true;
    }
    render(highlighter: Highlighter, document: Document, range_rect: DOMRect): void
    {
        console.log(range_rect, this.document_range);
        if (this.divs_container == null)
        {
            this.divs_container = document.createElement('div');
            this.divs_container.setAttribute('style', `
                display: block;
                position: absolute;
                overflow: visible;
                visibility: hidden;
                background-color: rgba(255, 255, 255, 0.0);
                transition: background-color 0.25s ease-in-out;
                z-index: 999999;
            `);
            highlighter.highlights.appendChild(this.divs_container);
            const t = window.setTimeout(
                () => {
                    const [r, g, b, a] = this._color;
                    const c_string: string = `rgba(${r},${g},${b},${a})`;
                    this.divs_container.style.backgroundColor = c_string;
                    window.clearTimeout(t);
                }, 0
            )
        }
        this.divs_container.style.left = `${(range_rect.left + window.scrollX) - highlighter.highlights_rect_rel.left}px`;
        this.divs_container.style.top = `${(range_rect.top + window.scrollY) - highlighter.highlights_rect_rel.top}px`;
        const dom_rects: DOMRectList = this.document_range.getClientRects();

        while (dom_rects.length > this.divs.length)
        {
            const element: HTMLDivElement = document.createElement('div');
            element.setAttribute('style', `
                display: block;
                position: absolute;
                display: block;
                visibility: visible;
                background-color: inherit;
            `);
            this.divs_container.appendChild(element);
            this.divs.push(element);
        }

        while (dom_rects.length < this.divs.length)
            this.divs.pop().remove();

        for (let i: number = 0; i < this.divs.length; ++i)
        {
            const new_rect = dom_rects.item(i);
            const div = this.divs[i];
            div.style.left =    `${new_rect.left - range_rect.left}px`;
            div.style.top =     `${new_rect.top - range_rect.top}px`;
            div.style.width =   `${new_rect.width}px`;
            div.style.height =  `${new_rect.height}px`;
        }
    }

    set color(c: [number, number, number, number])
    {
        this._color = c;
        if (this.divs_container != null)
        {
            const [r, g, b, a] = this._color;
            const c_string: string = `rgba(${r},${g},${b},${a})`;
            this.divs_container.style.backgroundColor = c_string;
        }
    }
    
    remove(): void
    {
        if (this.divs_container != null)
        {
            this.divs_container.remove();
            this.divs_container = null;
        }
        if (this.divs.length > 0)
        {
            for (const div of this.divs)
                div.remove();

            this.divs = new Array<HTMLDivElement>();
        }
    }
};