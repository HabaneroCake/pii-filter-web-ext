const properties: Array<string> = [
    'direction',  // RTL support
    'boxSizing',
    'width',  // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
    'height',
    'overflowX',
    'overflowY',  // copy the scrollbar for IE
    'overflowWrap',
  
    // 'borderTopWidth',
    // 'borderRightWidth',
    // 'borderBottomWidth',
    // 'borderLeftWidth',
    // 'borderStyle',
  
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
    'MozTabSize',

    'whiteSpace',
];

export function textarea_apply_css(text_area: HTMLElement, computed_style: CSSStyleDeclaration)
{
    for (let prop of properties)
        Reflect.set(text_area.style, prop, Reflect.get(computed_style, prop));

}