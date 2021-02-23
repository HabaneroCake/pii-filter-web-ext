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
        highlighter: Highlighter
    ): void;

    get_range(start_index: number, end_index: number): Range;

    remove(): void;
};

export interface HighlightContentParser
{
    set_highlighter(highlighter: Highlighter): void;
    resolve_content(
        content: string,
        resolver: (range_constructor: HighlighterRangesConstructor) => void
    ): void;
};

export interface DocHighlight
{
    current_range:                                          HighlightRange;
    document_range:                                         Range;
    update_range(range: HighlightRange):                    void;
    adjust_range(start?: number, end?: number):             void;
    render(
        highlighter: Highlighter,
        document: Document,
        range_rect: DOMRect
    ):   void;
    remove(): void;
};

export interface HighlightRange
{
    start:      number;
    end:        number;
};

export interface HighlightedRange extends HighlightRange
{
    highlight:  DocHighlight;
}

export interface HighlighterRangesConstructor
{
    ranges: Array<HighlightRange>,
    make_highlight: (
        highlight_range: HighlightRange,
        doc_range: Range
    ) => DocHighlight
};

export interface Highlighter
{
    highlights:             HTMLDivElement;
    highlights_rect_rel:    Rect;

    remove(): void;
    set_content_parser(content_parser: HighlightContentParser): void;
    set_text_entry_source(text_entry_source: HighlightTextEntrySource): void;
    update_ranges(ranges: Array<HighlightRange>, render: boolean): void;
    set_ranges(ranges_constructor: HighlighterRangesConstructor, adjust_overlapping_ranges: boolean): void;
    remove_ranges(ranges: Array<HighlightRange>, render: boolean): void;
    add_ranges(
        ranges_constructor: HighlighterRangesConstructor,
        render: boolean
    ): void;

    update_content(mutations: Array<HighlightTextEntryMutation>): void;
    update_position(): Promise<void>;
    update_scroll(): Promise<void>;
    update_layout(): Promise<void>;

    render(): Promise<void>;
};
