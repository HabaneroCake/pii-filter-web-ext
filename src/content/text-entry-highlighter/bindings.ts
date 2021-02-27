// Text highlighting utilities for textarea, input, and contenteditable elements
// Copyright (C) 2021 habanerocake

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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