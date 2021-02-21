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

export class BoxHighlightRange implements DocHighlight
{
    protected div_rects:    Array<DivRect> = new Array<DivRect>();
    protected _color:       [number, number, number, number];

    constructor(
        public current_range: HighlightRange,
        public document_range: Range,
        c: [number, number, number, number] = [255, 0, 0, 0.5]
    )
    {
        this.color = c;
    }
    
    update(
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
                        rect.height,
                        rect.width,
                        rect.height,
                        window.scrollX,
                        window.scrollY,
                    ),
                    div: null
                }
            );
        }
        
        const result = calc_array_diff<DivRect>(
            div_rects_new,
            this.div_rects,
            (lhs: DivRect, rhs: DivRect): boolean => {
                return lhs.rect.left_absolute == rhs.rect.left_absolute &&
                       lhs.rect.top_absolute == rhs.rect.top_absolute &&
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

        const [r, g, b, a] = this._color;
        const c_string: string = `rgba(${r},${g},${b},${a})`;
        for (const added of result.added)
        {
            const element: HTMLDivElement = document.createElement('div');
            element.setAttribute('style', `
                position: absolute;
                display: block;
                background-color: ${c_string};
                left:   ${added.rect.left_absolute}px;
                top:    ${added.rect.top_absolute}px;
                width:  ${added.rect.width}px;
                height: ${added.rect.height}px;
            `);
            added.div = element;
            this.div_rects.push(added);
            highlighter.highlights.appendChild(element);
        }
    }

    set color(c: [number, number, number, number])
    {
        this._color = c;
        const [r, g, b, a] = this._color;
        const c_string: string = `rgba(${r},${g},${b},${a})`;
        for (const element of this.div_rects)
            element.div.style.backgroundColor = c_string;
    }
    
    remove(): void
    {
        for (const div_rect of this.div_rects)
            div_rect.div.remove();

        this.div_rects = new Array<DivRect>();
    }
};