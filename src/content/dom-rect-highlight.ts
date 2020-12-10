import { Rect } from '../common/rect';
/**
 * Provides an overlay / highlight around a DOM element
 */

// TODO: add tracking of change in size
// TODO: should this only be a base class (managing correct pos/size deduction) which can be extended?

export class DOMRectHighlight
{
    private div: HTMLDivElement;

    /**
    * creates an overlay over / around the provided element
    * @param element the element to highlight
    */
    constructor(
        private document: Document,
        private rect: Rect,
        private border_width: number = 3,
        private radius: number = 5
    ) {
        // let range: Range = top_doc.createRange();
        // range.selectNode(element);

        this.div = this.document.createElement("div");
        // console.log("styling", element);

        // let bounding_rect: DOMRect = range.getBoundingClientRect();
        
        this.div.style.display =            'block';
        this.div.style.visibility =         'visible';
        this.div.style.position =           'absolute';
        this.div.style.left =               `${ this.rect.left }px`;
        this.div.style.top =                `${ this.rect.top }px`;
        // TODO: can clean this up for the different types of DOM elements / formatting
        this.div.style.width =              `${ this.rect.width }px`;
        this.div.style.height =             `${ this.rect.height }px`;
        this.div.style.margin =             `${ -this.border_width }px`;
        this.div.style.padding =            '0px';
        this.div.style.zIndex =             '9999';

        this.div.style.borderWidth =        `${ this.border_width }px`;
        this.div.style.borderStyle =        'solid';
        this.div.style.borderColor =        'rgba(0, 0, 0, 0)';

        this.div.style.borderRadius =       `${ this.radius }px`;

        this.div.style.pointerEvents =      'none';

        document.body.insertBefore(this.div, this.document.body.childNodes[0]);
    }
    /**
     * set the visibility
     */
    set visibility(visible: boolean)
    {
        this.div.style.visibility = visible ? 'visible' : 'hidden';
    }
    /**
     * set the border color
     */
    set color([r, g, b, a] : number[])
    {
        this.div.style.borderColor = `rgba(${ r }, ${ g }, ${ b }, ${ a })`;
    }
    /**
     * removes previous DOM modifications and returns null
     */
    public delete(): DOMRectHighlight
    {
        console.log("removing");
        this.div.remove();
        return null;
    }
};