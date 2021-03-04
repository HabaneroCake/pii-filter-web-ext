let items = []

class SettingsElement {
    constructor(id, def) {
        this.id = id;
        this.def = def;
    }

    load_from_storage() {
        browser.storage.local.get({[this.id]: this.def})
        .then(
            result => this.set_value(result[this.id]),
            error => console.log(`Error: ${error}`)
        )
    }

    save_to_storage(value) {
        browser.storage.local.set({
            [this.id]: value
        });
    }

    set_value(value) {
        throw new Error('Abstract method must be overridden.');
    }

    set_enabled(is_enabled) {
        throw new Error('Abstract method must be overridden.');
    }
};

class Toggle extends SettingsElement {
    constructor(toggle_id, value_text_id, text_values, def=false, on_change=null) {
        super(toggle_id, def);

        this.id =           toggle_id;
        this.toggle_div =   document.getElementById(toggle_id);
        this.value_span =   document.getElementById(value_text_id);
        this.text_values =  text_values;
        this.on_change =    on_change;
        this.active =       def;
            

        this.toggle_div.addEventListener('click', ev => {
            ev.preventDefault();
            this.active = !this.active;
            this.save_to_storage(this.active);
        });
    }

    set_value(value) {
        this.active = value;
    }

    set active(is_active) {
        this.value_span.innerText = this.text_values[is_active ? 0 : 1]

        if (is_active) {
            if (!this.toggle_div.classList.contains('active')) {
                this.toggle_div.classList.add('active');
            }
        } else {
            if (this.toggle_div.classList.contains('active')) {
                this.toggle_div.classList.remove('active');
            }
        }
        this._active = is_active;
        if (this.on_change != null)
            this.on_change(this, is_active);
    }

    get active() {
        return this._active;
    }

    set_enabled(is_enabled) {
        this.toggle_div.style.pointerEvents =   is_enabled? 'auto' : 'none';
        this.toggle_div.style.opacity =         is_enabled? '1' : '0.5';
    }
};
  
function restore_options() {  
    for (let item of items) {
        item.load_from_storage()
    }
}

const values = ['aan', 'uit']
items.push(new Toggle('highlights-active', 'highlights-active-text', values));

// keep at end
items.push(new Toggle('active', 'active-text', values, false, (el, new_val) => {
    for (let item of items) {
        if (item !== el) {
            item.set_enabled(new_val);
        }
    }
}));

document.addEventListener("DOMContentLoaded", restore_options);
document.addEventListener('contextmenu', event => event.preventDefault());