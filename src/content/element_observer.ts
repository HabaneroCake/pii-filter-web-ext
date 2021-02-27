import { Bindings } from './text-entry-highlighter/bindings';
import { Rect } from '../common/rect';

class StyleCalculator
{
    public default_style:       CSSStyleDeclaration;
    public comp_style:          CSSStyleDeclaration;
    protected el_div:           HTMLDivElement;
    constructor(
        document: Document,
        shadow: ShadowRoot,
        element: HTMLElement
    )
    {
        this.el_div = document.createElement('div');
        this.el_div.setAttribute('style', 'display: none');
        const element_base: HTMLElement = document.createElement(element.tagName);
        this.el_div.appendChild(element_base);
        shadow.appendChild(this.el_div);

        this.default_style =    window.getComputedStyle(element_base);
        this.comp_style =       window.getComputedStyle(element);
    }

    public filter_defaults(): Map<string, string>
    {
        let results: Map<string, string> = new Map<string, string>()

        for (let key of this.comp_style)
        {
            const comped_val: string = this.comp_style.getPropertyValue(key);
            if (this.default_style.getPropertyValue(key) !== comped_val)
                results.set(key, comped_val);
        }

        return results;
    }

    public remove()
    {
        this.el_div.remove();
    }
};

export class ElementObserver
{
    protected bindings:         Bindings = new Bindings();
    protected active:           boolean = true;
    public style_calculator:    StyleCalculator;

    constructor(
        document: Document,
        shadow: ShadowRoot,
        input_element: HTMLElement,
        polling_interval: number, // for uncaught changes
        on_rect_changed: (rect: Rect) => void,
        on_style_changed: (changed: Map<string, string>, all: Map<string, string>) => void,
    )
    {
        this.style_calculator = new StyleCalculator(document, shadow, input_element);
        // watch for style change
        const resize_attrs: Array<string> = ['width', 'height', 'inline-size', 'block-size'];
        let old_css: Map<string, string> = new Map<string, string>();
        for (let [key, value] of this.style_calculator.filter_defaults())
        {
            if (resize_attrs.indexOf(key) == -1)
            {
                old_css.set(
                    key,
                    value
                );
            }
        }
        const style_observer = new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) =>
        {
            let new_values: Map<string, string> = new Map<string, string>();
            for (let [key, value] of this.style_calculator.filter_defaults())
            {
                // if (resize_attrs.indexOf(key) == -1)
                // {
                    if (!old_css.has(key) || value != old_css.get(key))
                    {
                        new_values.set(key, value);
                        old_css.set(key, value);
                    }
                // }

            }
            if (new_values.keys.length > 0)
            {
                on_style_changed(new_values, old_css);
                update_rect_from_bounding_client();
            }
        });
        style_observer.observe(input_element, { attributes: true, attributeFilter: ['style', 'class'] });
        this.bindings.add_unbinding(() => { style_observer.disconnect(); });

        let last_rect: Rect = new Rect();
        const update_rect = (
            left: number,
            top: number,
            width: number,
            height: number,
            scroll_width: number =  input_element.scrollWidth,
            scroll_height: number = input_element.scrollHeight,
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
                on_rect_changed(new_rect);
                last_rect = new_rect;
            }
        }

        const update_rect_from_bounding_client = () => {
            const bounding_rect:    DOMRect =   input_element.getBoundingClientRect();
            update_rect(
                bounding_rect.left,
                bounding_rect.top,
                bounding_rect.width,
                bounding_rect.height
            );
        }

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
        intersect_observer.observe(input_element);
        this.bindings.add_unbinding(() => { intersect_observer.disconnect(); });

        // watch for element resize
        const resize_observer: ResizeObserver = new ResizeObserver((
            entries: ResizeObserverEntry[],
            observer: ResizeObserver
        ) => {
            update_rect_from_bounding_client();
        });
        resize_observer.observe(input_element);
        this.bindings.add_unbinding(() => { resize_observer.disconnect(); });

        // watch for window resize
        const win_resize_observer: ResizeObserver = new ResizeObserver((
            entries: ResizeObserverEntry[],
            observer: ResizeObserver
        ) => {
            update_rect_from_bounding_client();
        });
        win_resize_observer.observe(window.document.body);
        this.bindings.add_unbinding(() => { win_resize_observer.disconnect(); });

        // polling for uncaught changes
        const rect_polling_update = () => {
            if (this.active)
            {
                update_rect_from_bounding_client();
                setTimeout(rect_polling_update, polling_interval);
            }
        };
        // notify of initial changes
        on_style_changed(old_css, old_css);
        rect_polling_update();
    }

    public remove()
    {
        this.active = false;
        this.style_calculator.remove();
        this.bindings.remove();
    }
};