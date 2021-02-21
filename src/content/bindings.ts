export class Bindings
{
    /**
     * @protected
     * holds unbinding calls
     */
    protected unbind_calls: Array<()=>void> = new Array<()=>void>();
    
    /**
     * bind to an event and adds a clean-up function for delete()
     * @param element the element to listen to
     * @param event_name the event to listen for
     * @param event_cb the callback which will be called
     */
    public bind_event(
        element:    Element | Document | Window,
        event_name: string,
        event_cb:   (event: Event) => void
    )
    {
        element.addEventListener(event_name, event_cb);
        this.unbind_calls.push(() => {
            element.removeEventListener(event_name, event_cb);
        });
    }
    /**
     * add raw unbind call
     * @param unbind_call the call
     */
    public add_unbinding(unbind_call: () => void)
    {
        this.unbind_calls.push(unbind_call);
    }
    /**
     * removes all listeners and cleans up 
     */
    public remove()
    {
        for (let unbind_call of this.unbind_calls)
            unbind_call();
        
        this.unbind_calls = new Array<()=>void>();
    }
};