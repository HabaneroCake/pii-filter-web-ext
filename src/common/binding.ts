export class Binding
{
    public readonly unbind: (()=>void);
    constructor(
        add_listener,
        remove_listener,
        event_cb,
        event_name?
    )
    {
        if (event_name)
        {
            add_listener(event_name, event_cb);
            this.unbind = () => {
                remove_listener(event_name, event_cb);
            };
        }
        else
        {
            add_listener(event_cb);
            this.unbind = () => {
                remove_listener(event_cb);
            };
        }
    }
};