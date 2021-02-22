import {
    Highlighter, HighlightRange,
} from './highlighter'

import { calc_array_diff } from '../../common/array-diff';
import { DocHighlight } from './highlighter';
import { Rect } from '../../common/rect';

interface DivRect
{
    rect: Rect;
    div: HTMLDivElement;
};

export interface BoxIntensityRange extends HighlightRange
{
    intensity: number
};

export class BoxHighlightRange implements DocHighlight
{
    protected all_divs:     HTMLDivElement;
    protected div_rects:    Array<DivRect> = new Array<DivRect>();
    protected _color:       [number, number, number, number];
    current_range:          BoxIntensityRange;

    constructor(
        range: BoxIntensityRange,
        public document_range: Range,
    )
    {
        this.update_range(range);
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
        end_container:Node=this.document_range.endContainer
    ): void
    {
        this.current_range.start = start;
        this.current_range.end = end;
        this.document_range.setStart(
            start_container,
            start
        );
        this.document_range.setEnd(
            end_container,
            end
        );
    }
    render(highlighter: Highlighter, document: Document): void
    {
        if (this.all_divs == null)
        {
            this.all_divs = document.createElement('div');
            this.all_divs.setAttribute('style', `
                display: block;
                position: absolute;
                overflow: visible;
                visibility: hidden;
                background-color: rgba(255, 255, 255, 0.0);
                transition: background-color 0.25s ease-in-out;
            `);
            highlighter.highlights.appendChild(this.all_divs);
            const t = window.setTimeout(
                () => {
                    const [r, g, b, a] = this._color;
                    const c_string: string = `rgba(${r},${g},${b},${a})`;
                    this.all_divs.style.backgroundColor = c_string;
                    window.clearTimeout(t);
                }, 0
            )
        }
        const b_rect: DOMRect = this.document_range.getBoundingClientRect();
        this.all_divs.style.left = `${(b_rect.left + window.scrollX) - highlighter.highlights_rect_rel.left}px`;
        this.all_divs.style.top = `${(b_rect.top + window.scrollY) - highlighter.highlights_rect_rel.top}px`;

        console.log(b_rect, highlighter.highlights_rect_rel)

        const dom_rects: DOMRectList = this.document_range.getClientRects();

        const div_rects_new: Array<DivRect> = new Array<DivRect>();
        for (let i = 0; i < dom_rects.length; ++i)
        {
            const rect: DOMRect = dom_rects.item(i);
            div_rects_new.push(
                {
                    rect: new Rect(
                        rect.left,
                        rect.top,
                        rect.width,
                        rect.height
                    ),
                    div: null
                }
            );
        }
        
        const result = calc_array_diff<DivRect>(
            div_rects_new,
            this.div_rects,
            (lhs: DivRect, rhs: DivRect): boolean => {
                return lhs.rect.left == rhs.rect.left &&
                       lhs.rect.top == rhs.rect.top &&
                       lhs.rect.width == rhs.rect.width &&
                       lhs.rect.height == rhs.rect.height;
            }
        );
        
        for (const removed of result.removed)
        {
            const index: number = this.div_rects.indexOf(removed);
            this.div_rects[index].div.remove();
            this.div_rects.splice(index, 1)
        }

        for (const added of result.added)
        {
            const element: HTMLDivElement = document.createElement('div');
            element.setAttribute('style', `
                display: block;
                position: absolute;
                display: block;
                visibility: visible;
                background-color: inherit;
                left:   ${added.rect.left - b_rect.left}px;
                top:    ${added.rect.top - b_rect.top}px;
                width:  ${added.rect.width}px;
                height: ${added.rect.height}px;
            `);//?z-index necessary?
            added.div = element;
            this.div_rects.push(added);
            this.all_divs.appendChild(element);
        }
    }

    set color(c: [number, number, number, number])
    {
        this._color = c;
        if (this.all_divs != null)
        {
            const [r, g, b, a] = this._color;
            const c_string: string = `rgba(${r},${g},${b},${a})`;
            this.all_divs.style.backgroundColor = c_string;
        }
    }
    
    remove(): void
    {
        if (this.all_divs != null)
        {
            this.all_divs.remove();
            this.all_divs = null;
        }
        for (const div_rect of this.div_rects)
            div_rect.div.remove();

        this.div_rects = new Array<DivRect>();
    }
};