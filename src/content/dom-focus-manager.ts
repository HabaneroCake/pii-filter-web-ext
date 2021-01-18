import { Observable } from '../common/observable';

export class DOMFocusManager
{
    private _active_focus:  Observable.Variable<HTMLElement> =  new Observable.Variable<HTMLElement>();
    public active_focus:    Observable<HTMLElement> =           new Observable<HTMLElement>(this._active_focus);

    /**
     * creates and binds the focus manager
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
        if (event != null)
        {
            let target = event.target as HTMLElement;

            // traverse possible shadow roots
            while (target.shadowRoot && target.shadowRoot.activeElement)
                target = target.shadowRoot.activeElement as HTMLElement;

            this._active_focus.value = target;
        }
        else
            this.focus_out(null);
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
    
    /**
     * unfocus the input manager
     */
    public unfocus()
    {
        this._active_focus.value = null;
    }
};