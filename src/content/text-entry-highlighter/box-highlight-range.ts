import {
    Highlighter,
    HighlightRange
} from './highlighter'

import { calc_array_diff } from '../../common/array-diff';

export class BoxHighlightRange implements HighlightRange
{
    protected rects:    Array<DOMRect> =        new Array<DOMRect>();
    protected elements: Array<HTMLDivElement> = new Array<HTMLDivElement>();
    protected _color:   [number, number, number, number];

    constructor(
        public document_range: Range,
        c: [number, number, number, number] = [255, 0, 0, 0.5]
    )
    {
        this.color = c;
    }
    
    render(highlighter: Highlighter, document: Document): void
    {
        const rects_new: Array<DOMRect> = Array.from(this.document_range.getClientRects());
        const result = calc_array_diff<DOMRect>(
            rects_new,
            this.rects,
            (lhs: DOMRect, rhs: DOMRect): boolean => {
                return lhs.left == rhs.left &&
                       lhs.top == rhs.top &&
                       lhs.width == rhs.width &&
                       lhs.height == rhs.height;
            }
        );
        
        for (const removed of result.removed)
        {
            const index: number = this.rects.indexOf(removed);
            this.rects.splice(index, 1)
            this.elements[index].remove();
            this.elements.splice(index, 1)
        }

        const [r, g, b, a] = this._color;
        const c_string: string = `rgba(${r},${g},${b},${a})`;
        for (const added of result.added)
        {
            const element: HTMLDivElement = document.createElement('div');

            element.setAttribute('style', `
                position: absolute;
                background-color: ${c_string};
                left:   ${added.left}px;
                top:    ${added.top}px;
                width:  ${added.width}px;
                height: ${added.height}px;
            `);

            this.rects.push(added);
            this.elements.push(element);
            highlighter.highlights.appendChild(element);
        }
    }

    set color(c: [number, number, number, number])
    {
        this._color = c;
        const [r, g, b, a] = this._color;
        const c_string: string = `rgba(${r},${g},${b},${a})`;
        for (const element of this.elements)
            element.style.backgroundColor = c_string;
    }
    
    remove(): void
    {
        for (const element of this.elements)
            element.remove();

        this.rects =    new Array<DOMRect>();
        this.elements = new Array<HTMLDivElement>();
    }
};