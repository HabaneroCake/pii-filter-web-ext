/// <reference types="resize-observer-browser" />
import { Observable } from '../../common/observable';
import { ShadowDomDiv } from '../shadow-dom-div';
import { ClippedRect } from '../../common/clipped-rect';

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
    protected unbinders:    Array<()=>void> = new Array<()=>void>();

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

        let last_rect: [number, number, number, number] =   [0, 0, 0, 0];
        const update_rect = (
            left: number,
            top: number,
            width: number,
            height: number
        ) => {
            if (left != last_rect[0] ||
                top != last_rect[1] ||
                width != last_rect[2] ||
                height != last_rect[3])
            {
                this.mirror_rect(left, top, width, height);
                last_rect = [left, top, width, height]
                this._layout.notify();
            }
        }

        const update_rect_from_bounding_client = () => {
            const bounding_rect:    DOMRect =   this.input_element.getBoundingClientRect();
            update_rect(
                bounding_rect.left + window.scrollX,
                bounding_rect.top + window.scrollY,
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
                bounding_rect.left + window.scrollX,
                bounding_rect.top + window.scrollY,
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
        
        // watch for style change
        const style_observer = new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) =>
        {   // todo: can we update only the mutated attr?
            update_css_from_computed_style();
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
     * @param left x absolute
     * @param top y absolute
     * @param width w
     * @param height h
     */
    protected abstract mirror_rect(
        left: number,
        top: number,
        width: number,
        height: number
    ): void;
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
        
        let range: Range = document.createRange();
        range.setStart(this.get_mirror_div().childNodes[0], char_start_index);
        range.setEnd(this.get_mirror_div().childNodes[0], char_end_index);
        let relative_rects: DOMRectList = range.getClientRects();
        let absolute_rects: Array<ClippedRect> = new Array<ClippedRect>();
        
        for (let rect of relative_rects)
        {
            // only return rects in visible range
            const bounding_rect: DOMRect = this.get_mirror_div().getBoundingClientRect();
            
            // check if there is a partial overlap
            if (!(rect.bottom < bounding_rect.top ||
                rect.top > bounding_rect.bottom ||
                rect.left > bounding_rect.right ||
                rect.right < bounding_rect.left))
            {
                // clip rect
                const left_max:         number =    Math.max(rect.left, bounding_rect.left + 1);
                const right_min:        number =    Math.min(rect.right, bounding_rect.right - 1);
                const top_max:          number =    Math.max(rect.top, bounding_rect.top + 1);
                const bottom_min:       number =    Math.min(rect.bottom, bounding_rect.bottom - 1);
                const left_clipping:    number =    (left_max - rect.left);
                const right_clipping:   number =    (rect.right - right_min);
                const top_clipping:     number =    (top_max - rect.top);
                const bottom_clipping:  number =    (rect.bottom - bottom_min);
                const width:            number =    rect.width - left_clipping - right_clipping;
                const height:           number =    rect.height - top_clipping - bottom_clipping;

                absolute_rects.push(new ClippedRect(
                    left_max +      window.scrollX,
                    (left_clipping > 0),
                    right_min +     window.scrollX,
                    (right_clipping > 0),
                    top_max +       window.scrollY,
                    (top_clipping >  0),
                    bottom_min +    window.scrollY,
                    (bottom_clipping > 0),
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