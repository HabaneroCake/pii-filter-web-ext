import { Rect } from '../common/rect';
import { Margin } from '../common/margin';

export namespace Utils {
    export namespace DOM {
        /**
         * Returns true if a HTMLElement supports text entry
         * @param element the element to check
         */
        export function is_text_input(element: HTMLElement): boolean
        {
            return element.isContentEditable ||
                (element.nodeName == 'TEXTAREA' ||
                        (element.nodeName == 'INPUT' &&
                            ['text', 'search', 'email', 'url'].includes((element as HTMLInputElement).type)));
        }
        // export function get_shadow_root(element: Node): ShadowRoot
        // {
        //     if (element instanceof ShadowRoot) 
        //         return element;
            
        //     if (!element.parentNode) 
        //         return null;

        //     return get_shadow_root(element.parentNode);
        // }
        /**
         * returns the absolute coordinates of the provided element
         * @param element the element to get absolute coordinates of
         */
        export function absolute_rect(element: HTMLElement): Rect
        {
            let rect:               Rect = new Rect(0, 0, 0, 0);
            let bounding_rect =     element.getBoundingClientRect();

            rect.left =             bounding_rect.left;
            rect.top =              bounding_rect.top;

            rect.width =            bounding_rect.width;
            rect.height =           bounding_rect.height;

            return rect;
        };

        // TODO: get_text_input_value? (for distinguishing from element.isContentEditable)

        export class StylingMargins
        {
            static parent_div:  HTMLDivElement;
            static shadow_root: ShadowRoot;
            static outer_div:   HTMLDivElement;
            static inner_div:   HTMLDivElement;

            /**
             * initializes the calc objects
             */
            private static _initialize : boolean = (() => {
                StylingMargins.parent_div =     document.createElement("div");
                StylingMargins.shadow_root =    StylingMargins.parent_div.attachShadow({mode: 'closed'});

                StylingMargins.outer_div =      document.createElement("div");
                StylingMargins.inner_div =      document.createElement("div");

                StylingMargins.shadow_root.appendChild(StylingMargins.outer_div);
                StylingMargins.outer_div.appendChild(StylingMargins.inner_div);
                return true;
            })();

            /**
             * calculate all space styling takes up until enclosing element
             */
            public static calculate_all(element: HTMLElement): Margin
            {
                // document.body.appendChild(StylingMargins.parent_div);
                
                let computed_style =            window.getComputedStyle(element);

                this.outer_div.style.border =   computed_style.border;
                this.outer_div.style.padding =  computed_style.padding;
                this.outer_div.style.margin =   computed_style.margin;

                let inner_rect =                this.inner_div.getBoundingClientRect();
                let outer_rect =                this.outer_div.getBoundingClientRect();

                let bounds = new Margin(
                    inner_rect.left -   outer_rect.left,
                    inner_rect.top -    outer_rect.top,
                    inner_rect.right -  outer_rect.right,
                    inner_rect.bottom - outer_rect.bottom
                );

                // document.body.removeChild(StylingMargins.parent_div);

                return bounds;
            }
        };
    }
}

