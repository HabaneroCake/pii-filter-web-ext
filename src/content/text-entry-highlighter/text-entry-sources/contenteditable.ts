import { AbstractHighlightTextEntrySource } from '../abstract-highlight-text-entry-source';
import { Rect } from '../../../common/rect';
import { HighlightTextEntryMutationType, HighlightTextEntryMutation } from '../highlighter';

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
    'animation',
    'transition',
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

export class HighlightContentEditableSource extends AbstractHighlightTextEntrySource
{
    protected computed_style:           CSSStyleDeclaration;

    protected scrollbar_width:          number;
    protected selection:                [number, number] = [0, 0];

    constructor(
        element: HTMLElement,
        polling_interval: number
    )
    {
        super(element, polling_interval);
    }

    on_init()
    {
        const get_str = () => {
            const range: Range = this.document.createRange();
            range.selectNode(this.element)
            return range.toString();
        }

        this.value =            get_str();
        this.computed_style =   window.getComputedStyle(this.element);

        this.bindings.bind_event(this.element, 'change', (event: Event) => {
            this.value = get_str();
            const mutations: Array<HighlightTextEntryMutation> = [{
                type: HighlightTextEntryMutationType.change,
            }];
            this.update_content(mutations);
        });

        this.bindings.bind_event(this.element, 'input', (event: Event) => {
            const input_event: InputEvent = event as InputEvent;
            const old_text: string = this.value;
            const new_text: string = get_str();
            this.value = new_text;
            
            const length_diff: number = new_text.length - old_text.length;
            const length_diff_abs: number = Math.abs(length_diff);
            const type = input_event.inputType.toLocaleLowerCase();
            let mutations: Array<HighlightTextEntryMutation> = [];
            const replacing_selection: boolean = this.selection[0] != 
                                                 this.selection[1];
            // very basic input handling
            if (replacing_selection)
            {
                mutations.push({
                    type: HighlightTextEntryMutationType.remove,
                    index: this.selection[0],
                    length: this.selection[1] - this.selection[0]
                });
            }
            if (type.includes('insert') && length_diff > 0)
            {
                // TODO check for all types and add correct logic here
                mutations.push({
                    type: HighlightTextEntryMutationType.insert,
                    index: this.selection[0],
                    length: length_diff_abs
                });
            }
            else if (type.includes('delete') && length_diff < 0)
            {
                if (!replacing_selection)
                {
                    if (type.includes('backward'))
                    {
                        mutations.push({
                            type: HighlightTextEntryMutationType.remove,
                            index: this.selection[0] - length_diff_abs,
                            length: length_diff_abs
                        });
                    }
                    else
                    {   // all other is considered forwards for now
                        mutations.push({
                            type: HighlightTextEntryMutationType.remove,
                            index: this.selection[0],
                            length: length_diff_abs
                        });
                    }
                }
            }
            else
            {
                // TODO:
                // https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes and undo stack
                // or diff
                mutations.push({
                    type: HighlightTextEntryMutationType.change,
                });
            }
            this.update_content(mutations);
        });

        // sync scroll 
        const sync_scroll = () => {
            this.scroll = [
                this.element.scrollLeft,
                this.element.scrollTop
            ];
            this.highlighter.update_scroll();
        };
        this.bindings.bind_event(this.element, 'scroll', (event: Event) => {
            sync_scroll()
        });
        sync_scroll()
    };
    
    protected update_content(mutations: Array<HighlightTextEntryMutation>): void
    {
        this.highlighter.update_content(mutations);
        // slows things down considerably
        // if (this.rect.scroll_width != this.element.scrollWidth ||
        //     this.rect.scroll_height != this.element.scrollHeight)
        // {
        //     let rect_copy = Rect.copy(this.rect);
        //     rect_copy.scroll_width = this.element.scrollWidth;
        //     rect_copy.scroll_height = this.element.scrollHeight;
        //     this.on_rect_changed(
        //         rect_copy,
        //         false,
        //         true
        //     );
        // }
    }

    remove()
    {
        super.remove();
    }
    
    on_rect_changed(rect: Rect, position_changed: boolean, size_changed: boolean)
    {
        this.rect =                     rect;

        this.viewport_o =               Rect.copy(this.rect);
        this.viewport_o.left +=         this.element.clientLeft;
        this.viewport_o.top +=          this.element.clientTop;

        const overflowing_y: boolean =  this.element.scrollHeight != this.element.clientHeight;
        this.viewport_o.width =         this.rect.width - (
            (overflowing_y ? this.scrollbar_width : 0) +
            parseFloat(this.computed_style.borderLeftWidth) +
            parseFloat(this.computed_style.borderRightWidth)
        );

        const overflowing_x: boolean =  this.element.scrollWidth != this.element.clientWidth;
        this.viewport_o.height =        this.rect.height - (
            (overflowing_x ? this.scrollbar_width : 0) +
            parseFloat(this.computed_style.borderTopWidth) +
            parseFloat(this.computed_style.borderBottomWidth)
        );

        // this.mirror.style.width =          `${this.viewport_o.width}px`;
        // this.mirror.style.height =         `${this.viewport_o.height}px`;
        
        // //?
        // this.mirror.style.paddingLeft =     this.computed_style.paddingLeft;
        // this.mirror.style.paddingTop =      this.computed_style.paddingTop;
        // this.mirror.style.paddingRight =    this.computed_style.paddingRight;
        // this.mirror.style.paddingBottom =   this.computed_style.paddingBottom;

        this.viewport_i =               Rect.copy(this.viewport_o);
        if (true) //! TODO: check if firefox
        {
            const pd_l:     number =    parseFloat(this.computed_style.paddingLeft);
            const pd_t:     number =    parseFloat(this.computed_style.paddingTop);
            const pd_r:     number =    parseFloat(this.computed_style.paddingRight);
            const pd_b:     number =    parseFloat(this.computed_style.paddingBottom);
            this.viewport_i.top +=      pd_t;
            this.viewport_i.left +=     pd_l
            this.viewport_i.width -=    pd_l + pd_r;
            this.viewport_i.height -=   pd_t + pd_b;
        }

        if (position_changed)
            this.highlighter.update_position();
        if (size_changed)
            this.highlighter.update_layout();
    }

    on_style_changed(changes: Map<string, string>, all: Map<string, string>)
    {
        // for (let [key, value] of changes)
        // {
        //     if (!re_ignore_css_props.test(key))
        //         Reflect.set(this.mirror.style, key, value);
        // }

        // this.mirror.style.boxSizing =      'border-box';
        // this.mirror.style.overflow =       'visible';
        // this.mirror.style.textRendering =  'geometricPrecision';
        // this.mirror.style.border =         'none';

        // set defaults
        // if (!all.has('white-space')) //!? TODO
        //     this.mirror.style.whiteSpace =   'pre-wrap';
        // if (!all.has('word-wrap'))
        //     this.mirror.style.wordWrap =     'break-word';
        // if (!all.has('line-height'))
        //     this.mirror.style.lineHeight =   'normal';
        // this.mirror.style.cssText +=         'appearance: textarea;'; //?
        // this.mirror.style.pointerEvents =    'none';

        this.highlighter.update_layout();
    }
    
    get_range(start_index: number, end_index: number): Range
    {   // TODO: re-implement
        let range: Range = this.document.createRange();
        // let t_range: Range = this.document.createRange();
        // let node: Node = this.element.firstChild;
        // let index_offset: number = 0;

        // const parse_nodes = (node: Node) =>
        // {
        //     if (node.firstChild != null)
        //         parse_nodes(node.firstChild);
        //     else
        //     {
        //         t_range.selectNode(node);
        //         const len: number = t_range.toString().length;
        //         if (index_offset <= start_index && index_offset + len > start_index)
        //         {
        //             range.setStart(node, start_index - index_offset);
        //             console.log('set start', node);
        //         }
        //         if (index_offset <= end_index && index_offset + len >= start_index)
        //         {
        //             range.setEnd(node, end_index - index_offset);
        //             console.log('set end', node);
        //             return;
        //         }
        //         index_offset += len;
        //     }
        //     if (node.nextSibling != null)
        //         parse_nodes(node.nextSibling);
        // }
        // parse_nodes(node);
        // console.log(range);
        return range;
    }
};