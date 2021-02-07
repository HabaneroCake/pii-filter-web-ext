/// <reference types="resize-observer-browser" />
import { Observable } from '../../../common/observable';
import { ShadowDomDiv } from '../../shadow-dom-div';
import { ClippedRect } from '../../../common/clipped-rect';

// todo: split this up into input / textarea implementations and separate ff impl
// todo: deal with cols / rows
// add mutationobserver
// todo: deal with global / local css changes



export class HTMLChromeTextAreaMirror extends AbstractInputElementMirror
{

    protected mirror_content(value: string)
    {
        this.mirror_div.textContent =   value;
    }
    protected mirror_scroll(scrollLeft: number, scrollTop: number)
    {
        this.mirror_div.scrollLeft =    scrollLeft;
        this.mirror_div.scrollTop =     scrollTop;
    }
    protected mirror_rect(left: number, top: number, width: number, height: number)
    {
        console.log('update pos');
        this.div.style.top =            `${ top }px`;
        this.div.style.left =           `${ left }px`;
        if (this.browser_name == 'Firefox')
        {
            const computed_style: CSSStyleDeclaration = window.getComputedStyle(this.input_element, "");
            this.mirror_div.style.width =    computed_style.width;
            this.mirror_div.style.height =   computed_style.height;
        }
        else
        {
            this.mirror_div.style.width =    `${ width }px`;
            this.mirror_div.style.height =   `${ height }px`;
        }
    }
    protected mirror_style(computed_style: CSSStyleDeclaration)
    {
        throw new Error('Method not implemented.');
    }

    protected mirror_div:            HTMLDivElement;

    constructor(
        document: Document,
        protected input_element: HTMLInputElement | HTMLTextAreaElement
    ) {
        super(
            document,
            input_element
        );

        if (browser_name == 'Firefox')
        {
            this.mirror_div = this.document.createElement("div");
            this.div.appendChild(this.mirror_div);
        }
        else
            this.mirror_div = this.div;

        const bind_init = (
            div: HTMLDivElement,
            element: HTMLTextAreaElement | HTMLInputElement,
            text_padding: string,
            unbinders: Array<()=>void>
        ) => {
            const bind_event = (
                element: Element,
                evt_name: string,
                fn: (evt: Event) => void
            ) => {
                element.addEventListener(evt_name, fn);
                this.unbinders.push(() => {
                    element.removeEventListener(evt_name, fn);
                });
            }
            const copy_content = () => 
            {
                
                this._on_text_change.value =    element.value;
            };
            const sync_scroll = () => {
                
                this._on_layout_change.notify();
            };
            const copy_and_sync_scroll = () => {
                copy_content();
                sync_scroll();
            }

            let last_rect: [number, number, number, number] =   [0, 0, 0, 0];
            const update_position = (
                top: number,
                left: number,
                width: number,
                height: number
            ) => {
                if (top != last_rect[0] ||
                    left != last_rect[1] ||
                    width != last_rect[2] ||
                    height != last_rect[3])
                {
                    console.log('update pos');
                    this.div.style.top =                `${ top }px`;
                    this.div.style.left =               `${ left }px`;
                    if (browser_name == 'Firefox')
                    {
                        const computed_style: CSSStyleDeclaration = window.getComputedStyle(input_element, "");
                        this.mirror_div.style.width =    computed_style.width;
                        this.mirror_div.style.height =   computed_style.height;
                    }
                    else
                    {
                        this.mirror_div.style.width =    `${ width }px`;
                        this.mirror_div.style.height =   `${ height }px`;
                    }
                    last_rect =                         [top, left, width, height]
                    this._on_layout_change.notify();
                }
            }

            const update_position_from_rect = () => {
                const bounding_rect:    DOMRect =   input_element.getBoundingClientRect();
                update_position(
                    bounding_rect.top + window.scrollY,
                    bounding_rect.left + window.scrollX,
                    bounding_rect.width,
                    bounding_rect.height
                );
            }

            bind_event(element, 'scroll', (ev: Event) => {
                sync_scroll();
            });
            bind_event(element, 'input', (ev: Event) => {
                copy_and_sync_scroll();
            });
            bind_event(element, 'change', (ev: Event) => {
                copy_and_sync_scroll();
            });
            
            // intersection observer
            const intersect_observer = new IntersectionObserver(
                (entries: IntersectionObserverEntry[],
                 observer: IntersectionObserver) => {
                const bounding_rect:    DOMRect =   entries[0].boundingClientRect;
                update_position(
                    bounding_rect.top + window.scrollY,
                    bounding_rect.left + window.scrollX,
                    bounding_rect.width,
                    bounding_rect.height
                );
            }, {
                root:       document.querySelector('#scrollArea'),
                rootMargin: '0px',
                threshold:   ((): Array<number> => {
                    let arr: Array<number> = new Array<number>();
                    const n_steps: number = 100;
                    // TODO: generate this somewhere and keep it around
                    for (let i=0; i < n_steps + 1; ++i)
                        arr.push(i/n_steps);
                    return arr;
                })()
            });
            intersect_observer.observe(element);
            this.unbinders.push(() => { intersect_observer.disconnect(); });

            // watch for element resize
            const resize_observer: ResizeObserver = new ResizeObserver((
                entries: ResizeObserverEntry[],
                observer: ResizeObserver
            ) => {
                update_position_from_rect();
            });
            resize_observer.observe(element);
            this.unbinders.push(() => { resize_observer.disconnect(); });
            
            // watch for window resize
            const win_resize_observer: ResizeObserver = new ResizeObserver((
                entries: ResizeObserverEntry[],
                observer: ResizeObserver
            ) => {
                update_position_from_rect();
            });
            win_resize_observer.observe(window.document.body);
            this.unbinders.push(() => { win_resize_observer.disconnect(); });

            // polling for uncaught changes
            const polling_update = () => {
                update_position_from_rect();
                setTimeout(polling_update, polling_time);
            };
            polling_update();

            // sync initial
            copy_and_sync_scroll()
        };

        // copy css
        const computed_style: CSSStyleDeclaration = window.getComputedStyle(input_element, "");
        Array.from(computed_style).forEach(
            key => this.mirror_div.style.setProperty(
                        key,
                        computed_style.getPropertyValue(key),
                        computed_style.getPropertyPriority(key)
            )
        );

        this.mirror_div.style.cssText +=     'appearance: textarea;';
        // TODO: this should probably be handled on a case by case, not just auto
        this.mirror_div.style.overflow =     'auto';
        bind_init(this.mirror_div, input_element as HTMLTextAreaElement, '\0');

        // remove margins
        this.mirror_div.style.margin =                   '0px';
        this.mirror_div.style.marginTop =                '0px';
        this.mirror_div.style.marginBottom =             '0px';
        this.mirror_div.style.marginLeft =               '0px';
        this.mirror_div.style.marginRight =              '0px';
        this.mirror_div.style.marginBlockStart =         '0px';
        this.mirror_div.style.marginBlockEnd =           '0px';
        this.mirror_div.style.marginInlineStart =        '0px';
        this.mirror_div.style.marginInlineEnd =          '0px';

        // deal with discrepancies with ff / chrome (only with the textarea?)
        if (browser_name == 'Firefox')
        {
            this.div.style.boxSizing =                      'border-box';
            // simulate the inner padding
            this.mirror_div.style.padding =                  '0px';
            this.mirror_div.style.paddingLeft =              '0px';
            this.mirror_div.style.paddingRight =             '0px';
            this.mirror_div.style.paddingTop =               '0px';
            this.mirror_div.style.paddingBottom =            '0px';
            this.mirror_div.style.paddingBlockStart =        '0px';
            this.mirror_div.style.paddingBlockEnd =          '0px';
            this.mirror_div.style.paddingInlineStart =       '0px';
            this.mirror_div.style.paddingInlineEnd =         '0px';
            this.div.style.paddingTop =                     computed_style.paddingTop;
            this.div.style.paddingBottom =                  computed_style.paddingBottom;
            this.div.style.paddingBlockStart =              computed_style.paddingBlockStart;
            this.div.style.paddingBlockEnd =                computed_style.paddingBlockEnd;
            this.div.style.paddingInlineStart =             computed_style.paddingInlineStart;
            this.div.style.paddingInlineEnd =               computed_style.paddingInlineEnd;
            this.div.style.paddingLeft =                    computed_style.paddingLeft;
            this.div.style.paddingRight =                   computed_style.paddingRight;
        }
        else
            this.div.style.boxSizing =                      'border-box';

        this.root_div.style.pointerEvents =             'none';
        this.mirror_div.style.pointerEvents =            'none';
        this.div.style.pointerEvents =                  'none';
        this.mirror_div.style.display =                  'block';
        this.div.style.display =                        'block';
        // this.mirror_div.style.zIndex =                   '-99999';
        // this.mirror_div.style.opacity =                  '0.5';
        this.mirror_div.style.visibility =               'hidden';
        this.div.style.position =                       'absolute';
    }

    get value()
    {
        return (this.input_element as HTMLInputElement | HTMLTextAreaElement).value
    }

    public get_rects(char_start_index: number, char_end_index: number): Array<ClippedRect>
    {
        if (this.mirror_div.childNodes.length == 0)
            return [];
        
        const text_len: number = this.mirror_div.childNodes[0].textContent.length;

        char_start_index =  Math.min(char_start_index, text_len - 1);
        char_end_index =    Math.min(char_end_index, text_len);
        
        let range: Range = document.createRange();
        range.setStart(this.mirror_div.childNodes[0], char_start_index);
        range.setEnd(this.mirror_div.childNodes[0], char_end_index);
        let relative_rects: DOMRectList = range.getClientRects();
        let absolute_rects: Array<ClippedRect> = new Array<ClippedRect>();
        for (let rect of relative_rects)
        {
            // only return rects in visible range
            const bounding_rect: DOMRect = this.mirror_div.getBoundingClientRect();
            
            // check if there is a partial overlap
            if (!(rect.bottom < bounding_rect.top ||
                rect.top > bounding_rect.bottom ||
                rect.left > bounding_rect.right ||
                rect.right < bounding_rect.left))
            {
                // clip rect
                const left_max:         number =    Math.max(rect.left, bounding_rect.left + 1);
                const right_min:        number =    Math.min(rect.right, bounding_rect.right - 1);
                const top_max:          number =    Math.max(rect.top, bounding_rect.top + 1);
                const bottom_min:       number =    Math.min(rect.bottom, bounding_rect.bottom - 1);
                const left_clipping:    number =    (left_max - rect.left);
                const right_clipping:   number =    (rect.right - right_min);
                const top_clipping:     number =    (top_max - rect.top);
                const bottom_clipping:  number =    (rect.bottom - bottom_min);
                const width:            number =    rect.width - left_clipping - right_clipping;
                const height:           number =    rect.height - top_clipping - bottom_clipping;

                absolute_rects.push(new ClippedRect(
                    left_max +      window.scrollX,
                    (left_clipping > 0),
                    right_min +     window.scrollX,
                    (right_clipping > 0),
                    top_max +       window.scrollY,
                    (top_clipping >  0),
                    bottom_min +    window.scrollY,
                    (bottom_clipping > 0),
                    width,
                    height
                ));
            }
        }
        return absolute_rects;
    }

    public delete()
    {
        for (let unbinder of this.unbinders)
            unbinder();
        
        this.unbinders = new Array<()=>void>();

        super.delete();
    }
};


export class DOMInputMirror extends ShadowDomDiv
{
    protected mirror_div:            HTMLDivElement;
    protected unbinders:            Array<()=>void> = new Array<()=>void>();

    protected _on_text_change:      Observable.Variable<string> = new Observable.Variable<string>(false);
    public on_text_change:          Observable<string> =          new Observable(this._on_text_change);

    protected _on_layout_change:    Observable.Variable<void> = new Observable.Variable<void>(false);
    public on_layout_change:        Observable<void> =          new Observable(this._on_layout_change);

    constructor(
        document: Document,
        protected input_element: HTMLElement,
        browser_name: string
    ) {
        super(document);
        
        const polling_time: number = 1000;

        if (browser_name == 'Firefox')
        {   // need to simulate padding behaviour
            this.mirror_div = this.document.createElement("div");
            this.div.appendChild(this.mirror_div);
        }
        else
            this.mirror_div = this.div;

        const bind_init = (
            div: HTMLDivElement,
            element: HTMLTextAreaElement | HTMLInputElement,
            text_padding: string
        ) => {
            const bind_event = (
                element: Element,
                evt_name: string,
                fn: (evt: Event) => void
            ) => {
                element.addEventListener(evt_name, fn);
                this.unbinders.push(() => {
                    element.removeEventListener(evt_name, fn);
                });
            }

            const copy_content = () => 
            {
                div.textContent =               element.value + text_padding;
                this._on_text_change.value =    element.value;
            };

            const sync_scroll = () => {
                div.scrollLeft =     element.scrollLeft;
                div.scrollTop =      element.scrollTop;
                this._on_layout_change.notify();
            };
            const copy_and_sync_scroll = () => {
                copy_content();
                sync_scroll();
            }

            let last_rect: [number, number, number, number] =   [0, 0, 0, 0];
            const update_position = (
                top: number,
                left: number,
                width: number,
                height: number
            ) => {
                if (top != last_rect[0] ||
                    left != last_rect[1] ||
                    width != last_rect[2] ||
                    height != last_rect[3])
                {
                    console.log('update pos');
                    this.div.style.top =                `${ top }px`;
                    this.div.style.left =               `${ left }px`;
                    if (browser_name == 'Firefox')
                    {
                        const computed_style: CSSStyleDeclaration = window.getComputedStyle(input_element, "");
                        this.mirror_div.style.width =    computed_style.width;
                        this.mirror_div.style.height =   computed_style.height;
                    }
                    else
                    {
                        this.mirror_div.style.width =    `${ width }px`;
                        this.mirror_div.style.height =   `${ height }px`;
                    }
                    last_rect =                         [top, left, width, height]
                    this._on_layout_change.notify();
                }
            }

            const update_position_from_rect = () => {
                const bounding_rect:    DOMRect =   input_element.getBoundingClientRect();
                update_position(
                    bounding_rect.top + window.scrollY,
                    bounding_rect.left + window.scrollX,
                    bounding_rect.width,
                    bounding_rect.height
                );
            }

            bind_event(element, 'scroll', (ev: Event) => {
                sync_scroll();
            });
            bind_event(element, 'input', (ev: Event) => {
                copy_and_sync_scroll();
            });
            bind_event(element, 'change', (ev: Event) => {
                copy_and_sync_scroll();
            });
            
            // intersection observer
            const intersect_observer = new IntersectionObserver(
                (entries: IntersectionObserverEntry[],
                 observer: IntersectionObserver) => {
                const bounding_rect:    DOMRect =   entries[0].boundingClientRect;
                update_position(
                    bounding_rect.top + window.scrollY,
                    bounding_rect.left + window.scrollX,
                    bounding_rect.width,
                    bounding_rect.height
                );
            }, {
                root:       document.querySelector('#scrollArea'),
                rootMargin: '0px',
                threshold:   ((): Array<number> => {
                    let arr: Array<number> = new Array<number>();
                    const n_steps: number = 100;
                    // TODO: generate this somewhere and keep it around
                    for (let i=0; i < n_steps + 1; ++i)
                        arr.push(i/n_steps);
                    return arr;
                })()
            });
            intersect_observer.observe(element);
            this.unbinders.push(() => { intersect_observer.disconnect(); });

            // watch for element resize
            const resize_observer: ResizeObserver = new ResizeObserver((
                entries: ResizeObserverEntry[],
                observer: ResizeObserver
            ) => {
                update_position_from_rect();
            });
            resize_observer.observe(element);
            this.unbinders.push(() => { resize_observer.disconnect(); });
            
            // watch for window resize
            const win_resize_observer: ResizeObserver = new ResizeObserver((
                entries: ResizeObserverEntry[],
                observer: ResizeObserver
            ) => {
                update_position_from_rect();
            });
            win_resize_observer.observe(window.document.body);
            this.unbinders.push(() => { win_resize_observer.disconnect(); });

            // polling for uncaught changes
            const polling_update = () => {
                update_position_from_rect();
                setTimeout(polling_update, polling_time);
            };
            polling_update();

            // sync initial
            copy_and_sync_scroll()
        };

        // copy css
        const computed_style: CSSStyleDeclaration = window.getComputedStyle(input_element, "");
        Array.from(computed_style).forEach(
            key => this.mirror_div.style.setProperty(
                        key,
                        computed_style.getPropertyValue(key),
                        computed_style.getPropertyPriority(key)
            )
        );

        // styling based on mirror type
        switch (input_element.tagName)
        {
            // NOTE: appearance seems to be missing in CSSStyleDeclaration
            case 'INPUT':
                this.mirror_div.style.cssText +=     'appearance: textfield;';
                this.mirror_div.style.overflow =     'hidden';
                //?
                // this.mirror_div.style.font =         '-moz-field';
                // this.mirror_div.style.font =         '-webkit-small-control';
                // whitespace
                this.mirror_div.style.whiteSpace =   'pre';
                bind_init(this.mirror_div, input_element as HTMLInputElement, '');
                break
            case 'TEXTAREA':
                this.mirror_div.style.cssText +=     'appearance: textarea;';
                // TODO: this should probably be handled on a case by case, not just auto
                this.mirror_div.style.overflow =     'auto';
                bind_init(this.mirror_div, input_element as HTMLTextAreaElement, '\0');
                break;
            default: break;
        }

        // remove margins
        this.mirror_div.style.margin =                   '0px';
        this.mirror_div.style.marginTop =                '0px';
        this.mirror_div.style.marginBottom =             '0px';
        this.mirror_div.style.marginLeft =               '0px';
        this.mirror_div.style.marginRight =              '0px';
        this.mirror_div.style.marginBlockStart =         '0px';
        this.mirror_div.style.marginBlockEnd =           '0px';
        this.mirror_div.style.marginInlineStart =        '0px';
        this.mirror_div.style.marginInlineEnd =          '0px';

        // deal with discrepancies with ff / chrome (only with the textarea?)
        if (browser_name == 'Firefox')
        {
            this.div.style.boxSizing =                      'border-box';
            // simulate the inner padding
            this.mirror_div.style.padding =                  '0px';
            this.mirror_div.style.paddingLeft =              '0px';
            this.mirror_div.style.paddingRight =             '0px';
            this.mirror_div.style.paddingTop =               '0px';
            this.mirror_div.style.paddingBottom =            '0px';
            this.mirror_div.style.paddingBlockStart =        '0px';
            this.mirror_div.style.paddingBlockEnd =          '0px';
            this.mirror_div.style.paddingInlineStart =       '0px';
            this.mirror_div.style.paddingInlineEnd =         '0px';
            this.div.style.paddingTop =                     computed_style.paddingTop;
            this.div.style.paddingBottom =                  computed_style.paddingBottom;
            this.div.style.paddingBlockStart =              computed_style.paddingBlockStart;
            this.div.style.paddingBlockEnd =                computed_style.paddingBlockEnd;
            this.div.style.paddingInlineStart =             computed_style.paddingInlineStart;
            this.div.style.paddingInlineEnd =               computed_style.paddingInlineEnd;
            this.div.style.paddingLeft =                    computed_style.paddingLeft;
            this.div.style.paddingRight =                   computed_style.paddingRight;
        }
        else
            this.div.style.boxSizing =                      'border-box';

        this.root_div.style.pointerEvents =             'none';
        this.mirror_div.style.pointerEvents =            'none';
        this.div.style.pointerEvents =                  'none';
        this.mirror_div.style.display =                  'block';
        this.div.style.display =                        'block';
        // this.mirror_div.style.zIndex =                   '-99999';
        // this.mirror_div.style.opacity =                  '0.5';
        this.mirror_div.style.visibility =               'hidden';
        this.div.style.position =                       'absolute';
    }

    get value()
    {
        return (this.input_element as HTMLInputElement | HTMLTextAreaElement).value
    }

    public get_rects(char_start_index: number, char_end_index: number): Array<ClippedRect>
    {
        if (this.mirror_div.childNodes.length == 0)
            return [];
        
        const text_len: number = this.mirror_div.childNodes[0].textContent.length;

        char_start_index =  Math.min(char_start_index, text_len - 1);
        char_end_index =    Math.min(char_end_index, text_len);
        
        let range: Range = document.createRange();
        range.setStart(this.mirror_div.childNodes[0], char_start_index);
        range.setEnd(this.mirror_div.childNodes[0], char_end_index);
        let relative_rects: DOMRectList = range.getClientRects();
        let absolute_rects: Array<ClippedRect> = new Array<ClippedRect>();
        for (let rect of relative_rects)
        {
            // only return rects in visible range
            const bounding_rect: DOMRect = this.mirror_div.getBoundingClientRect();
            
            // check if there is a partial overlap
            if (!(rect.bottom < bounding_rect.top ||
                rect.top > bounding_rect.bottom ||
                rect.left > bounding_rect.right ||
                rect.right < bounding_rect.left))
            {
                // clip rect
                const left_max:         number =    Math.max(rect.left, bounding_rect.left + 1);
                const right_min:        number =    Math.min(rect.right, bounding_rect.right - 1);
                const top_max:          number =    Math.max(rect.top, bounding_rect.top + 1);
                const bottom_min:       number =    Math.min(rect.bottom, bounding_rect.bottom - 1);
                const left_clipping:    number =    (left_max - rect.left);
                const right_clipping:   number =    (rect.right - right_min);
                const top_clipping:     number =    (top_max - rect.top);
                const bottom_clipping:  number =    (rect.bottom - bottom_min);
                const width:            number =    rect.width - left_clipping - right_clipping;
                const height:           number =    rect.height - top_clipping - bottom_clipping;

                absolute_rects.push(new ClippedRect(
                    left_max +      window.scrollX,
                    (left_clipping > 0),
                    right_min +     window.scrollX,
                    (right_clipping > 0),
                    top_max +       window.scrollY,
                    (top_clipping >  0),
                    bottom_min +    window.scrollY,
                    (bottom_clipping > 0),
                    width,
                    height
                ));
            }
        }
        return absolute_rects;
    }

    public delete()
    {
        for (let unbinder of this.unbinders)
            unbinder();
        
        this.unbinders = new Array<()=>void>();

        super.delete();
    }
};