import { ElementMirror } from './element-mirror';
import { Rect } from '../../common/rect';

// from https://github.com/component/textarea-caret-position/blob/master/index.js
const properties: Array<string> = [
    'direction',  // RTL support
    'boxSizing',
    'width',  // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
    'height',
    'overflowX',
    'overflowY',  // copy the scrollbar for IE
    'overflowWrap',
  
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',
  
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
  
    // https://developer.mozilla.org/en-US/docs/Web/CSS/font
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
  
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',  // might not make a difference, but better be safe
  
    'letterSpacing',
    'wordSpacing',
  
    'tabSize',
    'MozTabSize'
];

/**
 * abstract mirror that covers things which are the same across browsers
 */
export abstract class AbstractHTMLTextAreaMirror extends ElementMirror
{
    constructor(
        document: Document,
        input_element: HTMLTextAreaElement | HTMLTextAreaElement,
        rect_polling_interval?: number
    ) {
        super(
            document,
            input_element,
            rect_polling_interval
        );
    }

    protected abstract get_viewport(): Rect;
    protected abstract get_mirror_div():  HTMLDivElement;

    protected mirror_content(value: string)
    {
        this.get_mirror_div().textContent =   value + '\0';
    }
    protected mirror_scroll(scrollLeft: number, scrollTop: number)
    {
        this.get_mirror_div().scrollLeft =    scrollLeft;
        this.get_mirror_div().scrollTop =     scrollTop;
    }
    protected abstract mirror_rect(rect: Rect): void;
    protected mirror_style(computed_style: CSSStyleDeclaration)
    {
        for (let prop of properties)
           Reflect.set(this.get_mirror_div().style, prop, Reflect.get(computed_style, prop));

        // this.get_mirror_div().style.cssText +=              'appearance: textarea;';
        
        // TODO: this should probably be handled on a case by case, not just auto
        this.get_mirror_div().style.overflow =              'auto';

        // remove margins
        this.get_mirror_div().style.margin =                '0px';
        this.get_mirror_div().style.marginTop =             '0px';
        this.get_mirror_div().style.marginBottom =          '0px';
        this.get_mirror_div().style.marginLeft =            '0px';
        this.get_mirror_div().style.marginRight =           '0px';
        this.get_mirror_div().style.marginBlockStart =      '0px';
        this.get_mirror_div().style.marginBlockEnd =        '0px';
        this.get_mirror_div().style.marginInlineStart =     '0px';
        this.get_mirror_div().style.marginInlineEnd =       '0px';

        this.get_mirror_div().style.display =               'block';
        this.get_mirror_div().style.pointerEvents =         'none';
        // debugging:
        // this.get_mirror_div().style.zIndex =                '-99999';
        this.get_mirror_div().style.opacity =               '0.5';
        // this.get_mirror_div().style.visibility =            'hidden';

        // this could be abstracted out
        // this.root_div.style.overflow =                      'hidden';
        this.root_div.style.pointerEvents =                 'none';
        this.div.style.pointerEvents =                      'none';
        this.div.style.display =                            'block';
        this.div.style.position =                           'absolute';
        //textRendering = 'geometricPrecision'; ?
    }
};

// back to scroll being in the wrong place and somehow pointerevents being ignored.