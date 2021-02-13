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
            (rect: Rect, style: CSSStyleDeclaration) => { this.on_rect_changed(rect, style); },
            (changes: Map<string, string>, all: Map<string, string>) => { this.on_style_changed(changes, all); },
        );
    }

    public delete()
    {
        this.bindings.delete();
        this.element_observer.delete();
        super.delete();
    }

    public abstract on_rect_changed(rect: Rect, style: CSSStyleDeclaration): void;
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

/**
 * this class exists as an overlay hack since mirroring a textarea doesn't *always* give the right result
 */
export class TextAreaInputInterface extends AbstractInputInterface
{
    protected input_overlay:            HTMLElement;
    protected overlay_str:              string = '';
    protected computed_style:           CSSStyleDeclaration;
    protected resize_timeout:           number;
    protected el_old_transition:        string;
    constructor(settings: InputInterfaceSettings)
    {
        super(settings);
        
        this.input_overlay = settings.document.createElement('div');
        this.computed_style = window.getComputedStyle(this.input_overlay);
        this.div.appendChild(this.input_overlay);

        const text_area_element: HTMLTextAreaElement = (this.settings.element as HTMLTextAreaElement);

        const set_overlay_text = (text: string) => {
            this.input_overlay.textContent = text + '\n'; // which is removed again below
        };

        // watch outside changes
        const element_input_callback = (event: Event) => {
            const new_text: string = text_area_element.value;
            if (new_text != this.overlay_str)
            {
                set_overlay_text(new_text);
                if (this.settings.on_input_changed != null)
                    this.settings.on_input_changed(new_text);
            }
        };
        
        // bind check if form or event changes textarea contents
        for (let event_name of ['input', 'change'])
            this.bindings.bind_event(this.settings.element, event_name, element_input_callback);

        const sync_contents = () =>
        {
            this.overlay_str = this.input_overlay.innerHTML.replace(/(\<\/div\>)|(^\<div\>)/g, '')
                                .replace(/(\<div\>\<\/?br\>)|(\<div\>|<\/?br\>)/g, '\n')
                                .replace(/&amp;/g, '&')
                                .replace(/&gt;/g, '>')
                                .replace(/&lt;/g, '<').replace(/\n$/, '');
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

        // keep at end
        super.init();

        const resize_observer: ResizeObserver = new ResizeObserver((
            entries: ResizeObserverEntry[],
            observer: ResizeObserver
        ) => {
            if (this.resize_timeout != null)
                return;
            // not sure if the following will always work
            this.resize_timeout = window.setTimeout(() => {
                if ((this.input_overlay.offsetWidth != this.settings.element.offsetWidth ||
                    this.input_overlay.offsetHeight != this.settings.element.offsetHeight))
                {
                    this.settings.element.style.width =    `${
                        this.input_overlay.offsetWidth - (parseFloat(this.computed_style.paddingLeft) +
                                                                parseFloat(this.computed_style.paddingRight))
                    }px`;
                    this.settings.element.style.height =    `${
                        this.input_overlay.offsetHeight - (parseFloat(this.computed_style.paddingTop) +
                                                                parseFloat(this.computed_style.paddingBottom))
                    }px`;
                }
                this.resize_timeout = null;
            }, 250);
        });
        resize_observer.observe(this.input_overlay);
        this.bindings.add_unbinding(() => { resize_observer.disconnect(); });

        // sync initial contents
        set_overlay_text(text_area_element.value);
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
        if (this.resize_timeout != null)
            window.clearTimeout(this.resize_timeout);
        super.delete();
        // show input element
        this.settings.element.style.visibility = 'visible';
        this.settings.element.style.transition = this.el_old_transition;
    }

    public on_rect_changed(rect: Rect, style: CSSStyleDeclaration)
    {
        rect.apply_position_to_element(this.div, true);
        rect.apply_width_and_height_to_element(this.input_overlay);
    }

    public on_style_changed(changes: Map<string, string>, all: Map<string, string>)
    {
        for (let [key, value] of changes)
        {
            if ([ // ignore following
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
    protected bindings:         Bindings =                  new Bindings();
    protected input_interface:  AbstractInputInterface;

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
// sync range highlighting
// regexp -> function, parse each element -> index -> ranges? or list of ranges -> regexp, highlighting?

// input 1 line same functionality

// TODO: eventually:
// poll for uncaught css changes
// redo firefox support so that ctr/cmd keycomb work. or try different approach
// have scroll work other way around if not triggered by own el.