import { Rect } from '../../common/rect';

export enum HighlightTextEntryMutationType
{
    change,
    insert,
    remove
};
export interface HighlightTextEntryMutation
{
    type:       HighlightTextEntryMutationType;
    index?:     number;
    length?:    number;
};

export interface HighlightTextEntrySource
{
    value:      string;
    
    document:   Document;
    shadow:     ShadowRoot;
    scroll:     [number, number];
    
    rect:       Rect;
    viewport_o: Rect;
    viewport_i: Rect;

    init(
        document: Document,
        shadow: ShadowRoot,
        content_parser: HighlightContentParser,
        highlighter: Highlighter
    ): void;

    get_range(start_index: number, end_index: number): Range;

    remove(): void;
};
export interface HighlightContentParser
{
    set_highlighter(highlighter: Highlighter): void;
    set_text_entry_source(text_entry_source: HighlightTextEntrySource): void;
    update_content(mutations: Array<HighlightTextEntryMutation>): void;
};

export interface DocHighlight
{
    current_range:                                          HighlightRange;
    document_range:                                         Range;
    update(start?: number, end?: number):                   void;
    render(highlighter: Highlighter, document: Document):   void;
    remove(): void;
};

export interface HighlightRange
{
    start:      number;
    end:        number;
};

export interface HighlightedRange extends HighlightRange
{
    highlight:      DocHighlight;
}

export interface Highlighter
{
    highlights: HTMLDivElement;

    remove(): void;

    set_text_entry_source(text_entry_source: HighlightTextEntrySource): void;
    set_ranges(
        ranges: Array<HighlightRange>,
        make_highlight: (
            highlight_range: HighlightRange,
            doc_range: Range
        ) => DocHighlight
    ): void;
    remove_ranges(ranges: Array<HighlightRange>): void;
    add_ranges(
        ranges: Array<HighlightRange>,
        make_highlight: (
            highlight_range: HighlightRange,
            doc_range: Range
        ) => DocHighlight
    ): void;

    update_content(mutations: Array<HighlightTextEntryMutation>): void;
    update_position(): void;
    update_scroll(): void;
    update_layout(): void;

    // scroll(Width|Height) == oldScroll(Width|Height) && size_changed
    // this could work if changes need to be above 1px or so before counting as vp instead of layout
    // update_viewport(): void;

    render(): void;
};
