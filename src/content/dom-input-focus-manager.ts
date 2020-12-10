import { Observable } from '../common/observable';
import { Utils } from './utils'

export class DOMInputFocusManager
{
    private _active_focus:  Observable.Variable<HTMLElement> =  new Observable.Variable<HTMLElement>();
    public active_focus:    Observable<HTMLElement> =           new Observable<HTMLElement>(this._active_focus);

    /**
     * creates and binds the input focus manager
     * @param element the DOM element to bind to
     */
    constructor(element: Node)
    {
        element.addEventListener('focusin', this.focus_in.bind(this), false);
        element.addEventListener('focusout', this.focus_out.bind(this), false);
    }

    /**
     * callback for focusin event
     * @param event the event
     */
    private focus_in(event: FocusEvent) 
    {
        let target = event.target as HTMLElement;

        // traverse possible shadow roots
        while (target.shadowRoot && target.shadowRoot.activeElement)
            target = target.shadowRoot.activeElement as HTMLElement;

        if (Utils.DOM.is_text_input(target))
            this._active_focus.value = target;
    }

    /**
     * callback for focusout event
     * @param event the event
     */
    private focus_out(event: FocusEvent) 
    {
        if (this._active_focus.value != null)
            this._active_focus.value = null;
    }
};