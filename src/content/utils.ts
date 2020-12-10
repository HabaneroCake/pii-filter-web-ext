import { Rect } from '../common/rect';
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
        /**
         * returns the absolute coordinates of the provided element
         * @param element the element to get absolute coordinates of
         */
        export function absolute_rect(element: HTMLElement): Rect
        {
            let rect: Rect = new Rect(0, 0, element.clientWidth, element.clientHeight);

            do {
                rect.left +=    element.offsetLeft  || 0;
                rect.top +=     element.offsetTop   || 0;
                element =       element.offsetParent as HTMLElement;
            } while(element);

            return rect;
        };
        // TODO: get_text_input_value? (for distinguishing from element.isContentEditable)
    }
}

