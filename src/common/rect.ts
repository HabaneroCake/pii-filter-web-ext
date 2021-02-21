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

    public apply_position_to_element(
        element: HTMLElement,
        absolute: boolean=false,
        inner_element?: HTMLElement
    )
    {
        if (absolute)
        {
            element.style.left =    `${this.left_absolute + (inner_element ? inner_element.clientLeft : 0)}px`;
            element.style.top =     `${this.top_absolute + (inner_element ? inner_element.clientTop : 0)}px`;
        }
        else
        {
            element.style.left =    `${this.left + (inner_element ? inner_element.clientLeft : 0)}px`;
            element.style.top =     `${this.top + (inner_element ? inner_element.clientTop : 0)}px`;
        }
    }

    public apply_width_and_height_to_element(
        element: HTMLElement,
        inner_element?: HTMLElement
    )
    {
        if (inner_element)
        {
            element.style.width =   `${inner_element.clientWidth}px`;
            element.style.height =  `${inner_element.clientHeight}px`;
        }
        else
        {
            element.style.width =   `${this.width}px`;
            element.style.height =  `${this.height}px`;
        }
    }

    public apply_to_element(
        element: HTMLElement,
        position: boolean = true,
        absolute: boolean = false,
        inner_element?: HTMLElement
    )
    {
        if (position)
            this.apply_position_to_element(element, absolute, inner_element);

        this.apply_width_and_height_to_element(element, inner_element);
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
    static copy(rect: Rect): Rect
    {
        let new_rect: Rect = new Rect();
        for (let key in rect)
            Reflect.set(new_rect, key, Reflect.get(rect, key));
        return new_rect;
    }
}