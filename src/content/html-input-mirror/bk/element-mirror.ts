/// <reference types="resize-observer-browser" />
import { Observable } from '../../common/observable';
import { ShadowDomDiv } from '../shadow-dom-div';
import { ClippedRect } from '../../common/clipped-rect';
import { Rect } from '../../common/rect';
/**
 * Forms a base from which to build an HTML input/textarea mirror element
 */
export abstract class ElementMirror extends ShadowDomDiv
{
    /** 
     * @protected
     * Set text content (events)
     */
    protected _text_content:        Observable.Variable<string> =   new Observable.Variable<string>(false);
    /** 
     * Observe text content (events)
     */
    public text_content:            Observable<string> =            new Observable(this._text_content);
    /**
     * @protected
     * Set layout (events)
     */
    protected _layout:              Observable.Variable<void> =     new Observable.Variable<void>(false);
    /**
     * Observe layout (events)
     */
    public layout:                  Observable<void> =              new Observable(this._layout);

    /**
     * @protected
     * Stores clean-up actions
     */
    protected unbinders:            Array<()=>void> =               new Array<()=>void>();
    /**
     * create a new abstract element mirror
     * @param document the document element to create the shadow dom on
     * @param input_element the input html element
     * @param init_before a callback to call before constructing
     * @param rect_polling_interval how often to check for unregistered changes to position / size (ms)
     */
    constructor(
        document: Document,
        protected input_element: HTMLInputElement | HTMLTextAreaElement,
        protected rect_polling_interval: number = 1000
    )
    {
        super(document);
    }
    /**
     * call this in extension class to bind mirror
     */
    protected init(): void
    {
        // add an event listener along with its removal func
        const bind_event = (
            element: Element,
            evt_name: string,
            fn: (evt: Event) => void
        ) => {
            element.addEventListener(evt_name, fn);
            this.unbinders.push(() => {
                element.removeEventListener(evt_name, fn);
            });
        }
        const copy_content = () => {
            this.mirror_content(this.input_element.value);
            this._text_content.value = this.input_element.value;
        };
        const sync_scroll = () => {
            this.mirror_scroll(this.input_element.scrollLeft, this.input_element.scrollTop);
            this._layout.notify();
        };
        const copy_and_sync_scroll = () => {
            copy_content();
            sync_scroll();
        }

        let last_rect: Rect = new Rect();
        const update_rect = (
            left: number,
            top: number,
            width: number,
            height: number,
            scroll_width: number =  this.input_element.scrollWidth,
            scroll_height: number = this.input_element.scrollHeight,
            scroll_x: number =      window.scrollX,
            scroll_y: number =      window.scrollY
        ) => {
            if (left != last_rect.left ||
                top != last_rect.top ||
                width != last_rect.width ||
                height != last_rect.height ||
                scroll_width != last_rect.scroll_width || 
                scroll_height != last_rect.scroll_height ||
                scroll_x != last_rect.absolute_offs_x ||
                scroll_y != last_rect.absolute_offs_y
            )
            {
                const new_rect = new Rect(
                    left,
                    top,
                    width,
                    height,
                    scroll_width,
                    scroll_height,
                    scroll_x,
                    scroll_y
                )
                this.mirror_rect(new_rect);
                
                last_rect = new_rect;
                this._layout.notify();
            }
        }

        const update_rect_from_bounding_client = () => {
            const bounding_rect:    DOMRect =   this.input_element.getBoundingClientRect();
            update_rect(
                bounding_rect.left,
                bounding_rect.top,
                bounding_rect.width,
                bounding_rect.height
            );
        }

        const update_css_from_computed_style = () => {
            this.mirror_style(window.getComputedStyle(this.input_element, ""));
        };

        bind_event(this.input_element, 'scroll', (ev: Event) => {
            sync_scroll();
        });
        bind_event(this.input_element, 'input', (ev: Event) => {
            copy_and_sync_scroll();
        });
        bind_event(this.input_element, 'change', (ev: Event) => {
            copy_and_sync_scroll();
        });
        
        // intersection observer
        const intersect_observer = new IntersectionObserver(
            (entries: IntersectionObserverEntry[],
             observer: IntersectionObserver) => {
            const bounding_rect:    DOMRect =   entries[0].boundingClientRect;
            update_rect(
                bounding_rect.left,
                bounding_rect.top,
                bounding_rect.width,
                bounding_rect.height
            );
        }, {
            root:       document.querySelector('#scrollArea'),
            rootMargin: '0px',
            threshold:   ((): Array<number> => {
                let arr: Array<number> = new Array<number>();
                const n_steps: number = 100;
                // TODO: generate this somewhere and keep it around
                for (let i=0; i < n_steps + 1; ++i)
                    arr.push(i/n_steps);
                return arr;
            })()
        });
        intersect_observer.observe(this.input_element);
        this.unbinders.push(() => { intersect_observer.disconnect(); });

        // watch for element resize
        const resize_observer: ResizeObserver = new ResizeObserver((
            entries: ResizeObserverEntry[],
            observer: ResizeObserver
        ) => {
            update_rect_from_bounding_client();
        });
        resize_observer.observe(this.input_element);
        this.unbinders.push(() => { resize_observer.disconnect(); });
        
        // TODO: check if this is only a resize event

        // watch for style change / resize
        let old_css: Map<string, string> = new Map<string, string>();
        for (let key of this.input_element.style)
        {
            old_css.set(
                key,
                this.input_element.style.getPropertyValue(key)
            );
        }
        const resize_attrs: Array<string> = ['width', 'height', 'inline-size', 'block-size'];
        const style_observer = new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) =>
        {
            let is_resize: boolean = true;
            for (let key of this.input_element.style)
            {
                const new_property_val: string = this.input_element.style.getPropertyValue(key);
                if (new_property_val != old_css.get(key))
                {
                    if (resize_attrs.indexOf(key) == -1)
                        is_resize = false;
                        
                    old_css.set(key, new_property_val);
                }

            }
            if (!is_resize)
            {
                update_css_from_computed_style();
                update_rect_from_bounding_client();
            }
        });
        style_observer.observe(this.input_element, { attributes: true, attributeFilter: ['style', 'class'] });
        this.unbinders.push(() => { style_observer.disconnect(); });

        // watch for window resize
        const win_resize_observer: ResizeObserver = new ResizeObserver((
            entries: ResizeObserverEntry[],
            observer: ResizeObserver
        ) => {
            update_rect_from_bounding_client();
        });
        win_resize_observer.observe(window.document.body);
        this.unbinders.push(() => { win_resize_observer.disconnect(); });

        // polling for uncaught changes
        const rect_polling_update = () => {
            update_rect_from_bounding_client();
            setTimeout(rect_polling_update, this.rect_polling_interval);
        };
        rect_polling_update();

        // sync initial
        copy_and_sync_scroll()
        update_rect_from_bounding_client();
        update_css_from_computed_style();
    }
    /**
     * @protected
     * the rect which will be used for clipping
     */
    protected abstract get_viewport(): Rect;
    /**
     * @protected
     * the mirror div which will be used for range lookups
     */
    protected abstract get_mirror_div():  HTMLDivElement;
    /**
     * called when the mirror needs to match the input content
     * @param value the text value
     */
    protected abstract mirror_content(value: string): void;
    /**
     * called when the mirror needs to match the input scroll position 
     * @param scrollLeft scroll pos x
     * @param scrollTop scroll pos y
     */
    protected abstract mirror_scroll(scrollLeft: number, scrollTop: number): void;
    /**
     * called when the mirror needs to move / resize its rect to match the input element
     * @param rect the rect
     */
    protected abstract mirror_rect(rect: Rect): void;
    /**
     * called when the mirror needs to match the input css
     * @param computed_style the computed style
     */
    protected abstract mirror_style(computed_style: CSSStyleDeclaration): void;
    /**
     * Gets the rect(s) for a certain text range, clipped by the viewport
     * @param char_start_index starting index in characters
     * @param char_end_index ending index in characters
     */
    public get_clipped_rects(char_start_index: number, char_end_index: number): Array<ClippedRect>
    {
        if (this.get_mirror_div().childNodes.length == 0)
            return [];
        
        const text_len: number = this.get_mirror_div().childNodes[0].textContent.length;

        char_start_index =  Math.min(char_start_index, text_len - 1);
        char_end_index =    Math.min(char_end_index, text_len);
        
        const main_node: Node = this.get_mirror_div().childNodes[0];
        let range: Range = this.document.createRange();
        range.setStart(main_node, char_start_index);
        range.setEnd(main_node, char_end_index);
        let relative_rects: DOMRectList = range.getClientRects();
        let absolute_rects: Array<ClippedRect> = new Array<ClippedRect>();
        
        for (let rect of relative_rects)
        {
            // only return rects in visible range
            const viewport: Rect = this.get_viewport();
            
            // check if there is a partial overlap
            if (!(rect.bottom < viewport.top ||
                rect.top >  viewport.bottom ||
                rect.left > viewport.right ||
                rect.right < viewport.left))
            {
                // clip rect
                const left_max:         number =    Math.max(rect.left,     viewport.left);
                const right_min:        number =    Math.min(rect.right,    viewport.right);
                const top_max:          number =    Math.max(rect.top,      viewport.top);
                const bottom_min:       number =    Math.min(rect.bottom,   viewport.bottom);
                // calculate clipping
                const left_clipping:    number =    (left_max -     rect.left);
                const right_clipping:   number =    (rect.right -   right_min);
                const top_clipping:     number =    (top_max -      rect.top);
                const bottom_clipping:  number =    (rect.bottom -  bottom_min);
                // adjust width and height
                const width:            number =    rect.width -    left_clipping - right_clipping;
                const height:           number =    rect.height -   top_clipping - bottom_clipping;

                absolute_rects.push(new ClippedRect(
                    left_max +          window.scrollX,
                    (left_clipping >    0),
                    (right_clipping >   0),
                    top_max +           window.scrollY,
                    (top_clipping >     0),
                    (bottom_clipping >  0),
                    width,
                    height
                ));
            }
        }
        return absolute_rects;
    }
    /**
     * Removes all listeners / created DOM elements and cleans up.
     */
    public delete()
    {
        for (let unbinder of this.unbinders)
            unbinder();
        
        this.unbinders = new Array<()=>void>();

        super.delete();
    }
}