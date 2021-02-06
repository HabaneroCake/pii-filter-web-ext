/**
 * simple rect type
 */
export class Rect
{
    constructor(
        public left:            number=0, 
        public top:             number=0,
        public width:           number=0,
        public height:          number=0,
        public scroll_width:    number=width,
        public scroll_height:   number=height,
        public absolute_offs_x: number=0,
        public absolute_offs_y: number=0,)
    {};
    get right(): number
    {
        return this.left + this.width;
    }
    get bottom(): number
    {
        return this.top + this.height;
    }
    get left_absolute(): number
    {
        return this.left + this.absolute_offs_x;
    }
    get top_absolute(): number
    {
        return this.top + this.absolute_offs_y;
    }
    get right_absolute(): number
    {
        return this.right + this.absolute_offs_x;
    }
    get bottom_absolute(): number
    {
        return this.bottom + this.absolute_offs_y;
    }

    static from_element(element: HTMLElement): Rect
    {
        const bounding_rect: DOMRect = element.getBoundingClientRect();
        return new Rect(
            bounding_rect.left,
            bounding_rect.top,
            bounding_rect.width,
            bounding_rect.height,
            element.scrollWidth,
            element.scrollHeight
        );
    }
    static from_rect(rect: Rect): Rect
    {
        let new_rect: Rect = new Rect();
        for (let key in rect)
            Reflect.set(new_rect, key, Reflect.get(rect, key));
        return new_rect;
    }
}