import { ShadowDomDiv } from '../shadow-dom';
import { Bindings } from '../bindings';
import { ElementObserver } from './element_observer';
import { Rect } from '../../common/rect';

// currently only works for 1 input at a time

export interface InputInterfaceSettings
{
    document:           Document;
    element:            HTMLElement;
    polling_interval:   number;
    on_blur?:           (event: Event) => void;
    on_input_changed?:  (value: string) => void;
};

export abstract class AbstractInputInterface extends ShadowDomDiv
{
    protected bindings:         Bindings = new Bindings();
    protected element_observer: ElementObserver;
    // add range display stuff here as well

    constructor(protected settings: InputInterfaceSettings)
    {
        super(settings.document);
        this.div.style.position = 'absolute';
    }

    protected init()
    {
        this.element_observer = new ElementObserver(
            document,
            this.settings.element,
            this.settings.polling_interval,
            (rect: Rect) => { this.on_rect_changed(rect); },
            (changes: Map<string, string>, all: Map<string, string>) => { this.on_style_changed(changes, all); },
        );
    }

    public delete()
    {
        this.bindings.delete();
        this.element_observer.delete();
        super.delete();
    }

    public abstract on_rect_changed(rect: Rect): void;
    public abstract on_style_changed(changes: Map<string, string>, all: Map<string, string>): void;
    public abstract contains(element: HTMLElement): boolean;
};

export function copy_event(event: Event, new_target?: HTMLElement): Event
{
    let event_dict: object = {};
    for (let key in event)
        Reflect.set(event_dict, key, Reflect.get(event, key));
    if (new_target != null && Reflect.has(event, 'target'))
        Reflect.set(event_dict, 'target', new_target);
    return new Event(event.type, event_dict);
}

export class TextAreaInputInterface extends AbstractInputInterface
{
    protected input_overlay:        HTMLElement;
    protected overlay_observer:     ElementObserver;
    protected overlay_str:          string = '';
    protected el_old_transition:    string;
    constructor(settings: InputInterfaceSettings)
    {
        super(settings);
        
        this.input_overlay = settings.document.createElement('div');
        this.div.appendChild(this.input_overlay);
        // const style: HTMLStyleElement = settings.document.createElement('style');
        // style.innerText = `
        //     .input_overlay {
        //         overflow-y: scroll;
        //         scrollbar-width: none;
        //         -ms-overflow-style: none;
        //     }
        //     .input_overlay::-webkit-scrollbar { 
        //         display: none;  /* Safari and Chrome */
        //     }
        // `;
        // this.div.appendChild(style);

        // TODO: sync selection start and end

        const text_area_element: HTMLTextAreaElement = (this.settings.element as HTMLTextAreaElement);

        // watch outside changes
        const element_input_callback = (event: Event) => {
            const new_text: string = text_area_element.value;
            if (new_text != this.overlay_str)
            {
                this.input_overlay.textContent = new_text;
                if (this.settings.on_input_changed != null)
                    this.settings.on_input_changed(new_text);
            }
        };
        
        // bind check if form or javascript changes textarea contents
        for (let event_name of ['input', 'change'])
            this.bindings.bind_event(this.settings.element, event_name, element_input_callback);

        // TODO: need to watch input of input as well? for form directed changes -> sync if not the same?
        // so forward some events from the input to the div as well, while making sure not to set value if it is the same

        // mutation observer as well?
        const sync_contents = () =>
        {
            this.overlay_str = this.input_overlay.innerHTML.replace(/(\<\/div\>)|(^\<div\>)/g, '')
                                .replace(/(\<div\>\<\/?br\>)|(\<div\>|<\/?br\>)/g, '\n')
                                .replace(/&amp;/g, '&')
                                .replace(/&gt;/g, '>')
                                .replace(/&lt;/g, '<');
            text_area_element.value = this.overlay_str;

        };
        
        const forward_event = (event: Event) => {
            const copied_event: Event = copy_event(event, this.settings.element);
            this.settings.element.dispatchEvent(copied_event);
        };

        // follow text changes
        for (let event_name of ['input', 'change'])
        {
            this.bindings.bind_event(this.input_overlay, event_name, (event: Event) => {
                sync_contents();
                forward_event(event);
                if (this.settings.on_input_changed != null)
                    this.settings.on_input_changed(this.overlay_str);
            });
        }

        // // keyup
        // this.bindings.bind_event(this.input_overlay, 'keydown', (event: Event) => {
        //     if ((event as KeyboardEvent).code == 'Tab')
        //         event.preventDefault();
        // });

        // events which should sync the contents before forwarding the event
        for (let event_name of [
            'focus', 'submit', 'cut', 'copy', 'paste', 'keydown', 'keyup', 'contextmenu', 'select', 'selectstart',
            'selectionchange'])
            this.bindings.bind_event(this.input_overlay, event_name, (event: Event) => {
                sync_contents();
                forward_event(event);
            });

        // forward a list of events (mouse click events are not forwarded since coords could be wrong)
        for (let event_name of [
            'reset', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout', 'drag', 'dragend', 'dragenter', 'dragstart', 
            'dragleave', 'dragover', 'drop', 'storage', 'message', 'open', 'orientationchange', 'deviceorientation',
            'devicemotion', 'pointerover', 'pointerenter', 'pointerout', 'pointerleave', 'show', 'success'
        ])
        {
            this.bindings.bind_event(this.input_overlay, event_name, (event: Event) => {
                const copied_event: Event = copy_event(event, this.settings.element);
                this.settings.element.dispatchEvent(copied_event);
            });
        }

        // TODO: selection and unselect?

        this.bindings.bind_event(this.input_overlay, 'scroll', (event: Event) => {
            this.settings.element.scrollTop = this.input_overlay.scrollTop;
            this.settings.element.scrollLeft = this.input_overlay.scrollLeft;
            const copied_event: Event = copy_event(event, this.settings.element);
            this.settings.element.dispatchEvent(copied_event);
        });

        this.bindings.bind_event(this.input_overlay, 'blur', (event: Event) => {
            if (this.settings.on_blur != null)
                this.settings.on_blur(event);
            const copied_event: Event = copy_event(event, this.settings.element);
            this.settings.element.dispatchEvent(copied_event);
        });

        this.overlay_observer = new ElementObserver(
            document,
            this.input_overlay,
            this.settings.polling_interval,
            (rect: Rect) => {
                // rect.apply_to_style(this.settings.element.style, false, false);
            },
            (changes: Map<string, string>) => {},
        );

        // keep at end
        super.init();

        // sync initial contents
        this.input_overlay.textContent = text_area_element.value;
        this.input_overlay.contentEditable = 'true';
        this.input_overlay.focus();
        // sync caret
        if (text_area_element.value.length > 0)
        {
            const range: Range = document.createRange();
            range.setStart(this.input_overlay.childNodes[0], text_area_element.selectionStart);
            range.setEnd(this.input_overlay.childNodes[0], text_area_element.selectionEnd);
            const selection: Selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }

        this.input_overlay.scrollTop =  this.settings.element.scrollTop;
        this.input_overlay.scrollLeft = this.settings.element.scrollLeft;

        // hide input element
        this.el_old_transition = this.settings.element.style.transition;
        this.settings.element.style.transition = 'none';
        this.settings.element.style.visibility = 'hidden';
    };

    public delete()
    {
        this.overlay_observer.delete();
        super.delete();
        // show input element
        this.settings.element.style.visibility = 'visible';
        this.settings.element.style.transition = this.el_old_transition;
    }

    public on_rect_changed(rect: Rect)
    {
        rect.apply_position_to_element(this.div, true);
        rect.apply_width_and_height_to_element(this.input_overlay);

        // TODO resizing
    }

    public on_style_changed(changes: Map<string, string>, all: Map<string, string>)
    {
        for (let [key, value] of changes)
        {
            if ([ // ignore following
                // 'border',
                // 'border-top',
                // 'border-bottom',
                // 'border-left',
                // 'border-right',
                'margin',
                'margin-top',
                'margin-bottom',
                'margin-left',
                'margin-right',
                'margin-block-start',
                'margin-block-end',
                'margin-inline-start',
                'margin-inline-end',
                'user-modify',
                '-webkit-user-modify',
                'visibility',
                'perspective-origin',
                'transform-origin'
            ].indexOf(key) == -1)
                Reflect.set(this.input_overlay.style, key, value);
            // console.log(key, value);
        }
        
        // overrides
        this.input_overlay.style.position =     'relative';
        this.input_overlay.style.boxSizing =    'border-box';
        this.input_overlay.style.display =      'block';
        this.input_overlay.style.margin =       '0px';
        this.input_overlay.style.zIndex =       '99999';
        this.input_overlay.style.transition =   'none';
        this.input_overlay.style.animation =    'none';

        // set defaults
        for (let key of ['overflow-x', 'overflow-y'])
            if (!all.has(key))
                this.input_overlay.style.setProperty(key, 'auto');
        if (!all.has('white-space'))
            this.input_overlay.style.whiteSpace =   'pre-wrap';
        if (!all.has('word-wrap'))
            this.input_overlay.style.wordWrap =     'break-word';
        if (!all.has('resize'))
            this.input_overlay.style.resize =       'both';
        if (!all.has('line-height'))
            this.input_overlay.style.lineHeight =   'normal';
        
        this.input_overlay.style.cssText +=         'appearance: textarea;';
    }
    
    public contains(element: HTMLElement): boolean
    {
        return (element == this.input_overlay);
    }
};

export class PIIFilterInputExtender
{
    protected bindings: Bindings = new Bindings();
    protected input_interface: AbstractInputInterface;

    constructor(main_document: Document)
    {
        // catch focus
        this.bindings.bind_event(document, 'focusin', (event: Event) => {
            const target_element: HTMLElement = event.target as HTMLElement;

            // TODO: keep old interface if it is of same type

            const on_blur = (event: Event) =>
            {
                // todo other stuff (check if this is because of other overlay)
                this.delete_interface();
            };

            // delete old interface
            if (this.input_interface != null)
                this.input_interface.delete();

            const settings: InputInterfaceSettings = {
                document:           document,
                element:            target_element,
                polling_interval:   5000,
                on_blur:            on_blur
            };

            const add_interface = () => {
                target_element.removeEventListener('mouseup', add_interface);
                target_element.removeEventListener('keyup', add_interface);

                // ignore if target is part of input interface
                if (this.input_interface != null && this.input_interface.contains(target_element))
                    return;

                if (target_element.nodeName == 'INPUT')
                    return // TODO
                else if (target_element.nodeName == 'TEXTAREA')
                    this.input_interface = new TextAreaInputInterface(settings);
                else if (target_element.isContentEditable)
                    return
                else
                    return;
                
                console.log('bound');
            };
            target_element.addEventListener('mouseup', add_interface);
            target_element.addEventListener('keyup', add_interface);
        });


        // catch input / clicking / polling
    }

    public delete_interface()
    {
        if (this.input_interface != null)
        {
            console.log('released');
            this.input_interface.delete();
            this.input_interface = null;
        }
    }

    public delete()
    {
        this.bindings.delete();
    }
};

// TODO:
// resize forwarding 
// have resize observer on overlay for size forwarding
// resizing could affect other element only after release?
// show last line if only newline / whitespace
// sync range highlighting

// TODO: eventually:
// poll for uncaught css changes
// redo firefox support so that ctr/cmd keycomb work. or try different approach
// have scroll work other way around if not triggered by own el.