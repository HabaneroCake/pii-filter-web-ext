import { ShadowDomDiv } from '../shadow-dom';
import { Bindings } from '../bindings';
import { ElementObserver } from './element_observer';
import { Rect } from '../../common/rect';
import { DOMRectHighlight } from '../dom-rect-highlight';

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

function get_scrollbar_width(document: Document): number
{
    // invisible container
    const outer: HTMLDivElement =   document.createElement('div');
    outer.style.visibility =        'hidden';
    outer.style.overflow =          'scroll';
    //? should this be on a shadow?
    document.body.appendChild(outer);
    //inner element
    const inner: HTMLDivElement =   document.createElement('div');
    outer.appendChild(inner);
    // calc width
    const width: number =           (outer.getBoundingClientRect().width - inner.getBoundingClientRect().width);
    // remove element
    outer.remove();

    return width;
}

const re_ignore_css_props: RegExp = new RegExp('(' + [
    'margin',
    'margin-top',
    'margin-bottom',
    'margin-left',
    'margin-right',
    'margin-block-start',
    'margin-block-end',
    'margin-inline-start',
    'margin-inline-end',
    'visibility',
    'position',
    'top',
    'left',
    'bottom',
    'right',
    'max-width',
    'max-height',
    'transform',
    'max-inline-size',
    'max-block-size',
    'width',
    'height'
].join('|') + ')', 'i')

export class TextAreaOverlay extends AbstractInputInterface
{
    protected text_node:                Text;
    protected computed_style:           CSSStyleDeclaration;
    protected rect:                     Rect = new Rect();
    protected viewport:                 Rect = new Rect();
    protected clip_rect:            Rect = new Rect();

    protected readonly scrollbar_width: number;
    protected scroll_offset:            [number, number] = [0, 0]

    protected t_highlight:              DOMRectHighlight;
    constructor(settings: InputInterfaceSettings)
    {
        super(settings);
        const text_area_element: HTMLTextAreaElement = (this.settings.element as HTMLTextAreaElement);
        
        // Get the scrollbar width
        this.scrollbar_width =  get_scrollbar_width(settings.document);        
        this.text_node =        settings.document.createTextNode(text_area_element.value);
        this.computed_style =   window.getComputedStyle(this.settings.element);
        this.div.appendChild(this.text_node);

        // initial styling
        this.div.setAttribute('aria-hidden', 'true')
        this.div.setAttribute('style', `
            position: absolute;
            height: 0;
            width: 0;
            top: 0;
            height: 0;
            color: red;
            overflow: hidden;
            mouse-events: none;
            // visibility: hidden;
        `)

        // watch outside changes
        const element_input_callback = (event: Event) => {
            const new_text: string = text_area_element.value;
            this.text_node.nodeValue = new_text;
            if (this.settings.on_input_changed != null)
                this.settings.on_input_changed(new_text);
        };

        // bind check if form or event changes textarea contents
        for (let event_name of ['input', 'change'])
            this.bindings.bind_event(this.settings.element, event_name, element_input_callback);
        
        // sync scroll
        const sync_scroll = () => {
            this.scroll_offset = [
                this.settings.element.scrollLeft,
                this.settings.element.scrollTop
            ];
            this.update_layout();
        };
        this.bindings.bind_event(this.settings.element, 'scroll', (event: Event) => {
            sync_scroll()
        });
        sync_scroll()

        // keep at end
        super.init();

        // bind blur action
        for (let event_name of ['blur', 'focusout'])
            this.bindings.bind_event(this.settings.element, event_name, (event: Event) => {
                let f_event: FocusEvent = event as FocusEvent;
                if (f_event.relatedTarget != this.text_node)
                {
                    if (this.settings.on_blur != null)
                        this.settings.on_blur(event);
                }
            });
    };

    public delete()
    {
        if (this.t_highlight != null)
            this.t_highlight.delete();

        super.delete();
    }


    protected update_layout()
    {
        const t_rect =  Rect.from_rect(this.rect);
        //! not sure if this should stay like this and recalc, think not, only offset of rects container should be adjusted
        t_rect.left -=  this.scroll_offset[0];
        t_rect.top -=   this.scroll_offset[1];
        t_rect.apply_position_to_element(this.div, true, this.settings.element);
    }
    
    public on_rect_changed(rect: Rect)
    {
        this.rect =                     rect;
        this.viewport =                 Rect.from_rect(this.rect);
        this.viewport.left +=           this.settings.element.clientLeft;
        this.viewport.top +=            this.settings.element.clientTop;

        const overflowing_y: boolean =  this.settings.element.scrollHeight != this.settings.element.clientHeight;
        this.viewport.width =           this.rect.width - (
            (overflowing_y ? this.scrollbar_width : 0) +
            parseFloat(this.computed_style.borderLeftWidth) +
            parseFloat(this.computed_style.borderRightWidth)
        );

        const overflowing_x: boolean =  this.settings.element.scrollWidth != this.settings.element.clientWidth;
        this.viewport.height =          this.rect.height - (
            (overflowing_x ? this.scrollbar_width : 0) +
            parseFloat(this.computed_style.borderTopWidth) +
            parseFloat(this.computed_style.borderBottomWidth)
        );

        this.div.style.width =          `${this.viewport.width}px`;
        this.div.style.height =         `${this.viewport.height}px`;

        this.clip_rect =                Rect.from_rect(this.viewport);
        if (true) //! TODO: check if firefox
        {
            const pd_l:     number =    parseFloat(this.computed_style.paddingLeft);
            const pd_t:     number =    parseFloat(this.computed_style.paddingTop);
            const pd_r:     number =    parseFloat(this.computed_style.paddingRight);
            const pd_b:     number =    parseFloat(this.computed_style.paddingBottom);
            this.clip_rect.top +=       pd_t;
            this.clip_rect.left +=      pd_l
            this.clip_rect.width -=     pd_l + pd_r;
            this.clip_rect.height -=    pd_t + pd_b;
        }

        this.update_layout();

        // TEMP
        if (this.t_highlight != null)
            this.t_highlight.delete();

        this.t_highlight = new DOMRectHighlight(document, this.clip_rect, 2);
        this.t_highlight.color = [0, 255, 0, 1.0];
    }

    public on_style_changed(changes: Map<string, string>, all: Map<string, string>)
    {
        for (let [key, value] of changes)
        {
            if (!re_ignore_css_props.test(key))
            {
                console.log(key);
                Reflect.set(this.div.style, key, value);
            }
        }

        // overrides
        // this.div.style.display =      "inline" === this.computed_style.display ? "inline-block" : this.computed_style.display;
        // this.div.style.position =     'relative';
        // this.div.style.display =      'block';
        // this.div.style.margin =       '0px';
        this.div.style.boxSizing =      'border-box';
        this.div.style.overflow =       'visible';
        // this.div.style.zIndex =       '99999';
        // this.div.style.transition =   'none';
        // this.div.style.animation =    'none';
        // this.div.style.borderRightWidth =   '0px';/
        // this.settings.element.style.textRendering ='geometricPrecision'; // !!@!TODO
        this.div.style.textRendering =  'geometricPrecision';
        this.div.style.border =         'none';

        // set defaults
        // for (let key of ['overflow-x', 'overflow-y'])
        //     if (!all.has(key))
        //         this.div.style.setProperty(key, 'auto');
        if (!all.has('white-space'))
            this.div.style.whiteSpace =   'pre-wrap';
        if (!all.has('word-wrap'))
            this.div.style.wordWrap =     'break-word';
        // if (!all.has('resize'))
        //     this.div.style.resize =       'both';
        if (!all.has('line-height'))
            this.div.style.lineHeight =   'normal';
        
        this.div.style.cssText +=         'appearance: textarea;';
        // this.div.style.outline =          '2px solid green';
        this.div.style.pointerEvents =    'none';
    }
    
    public contains(element: HTMLElement): boolean
    {
        return (element == this.div);
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

            const add_interface = (event: Event) => {
                target_element.removeEventListener('mouseup', add_interface);
                target_element.removeEventListener('keyup', add_interface);

                // ignore if target is part of input interface
                if (this.input_interface != null && this.input_interface.contains(target_element))
                    return;

                if (target_element.nodeName == 'INPUT')
                    return // TODO
                else if (target_element.nodeName == 'TEXTAREA')
                    this.input_interface = new TextAreaOverlay(settings);
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