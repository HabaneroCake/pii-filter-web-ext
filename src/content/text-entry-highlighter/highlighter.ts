import { Rect } from '../../common/rect';

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
        content_parser: HighlightContentParser,
        highlighter: Highlighter
    ): void;

    get_range(start_index: number, end_index: number): Range;
};

export interface HighlightContentParser
{
    set_highlighter(highlighter: Highlighter): void;
};

export interface DocHighlight
{
    document_range:     Range;
    render(highlighter: Highlighter, document: Document): void;
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
    remove_ranges(elements: Array<HighlightRange>): void;
    add_ranges(
        elements: Array<HighlightRange>,
        make_highlight: (
            highlight_range: HighlightRange,
            doc_range: Range
        ) => DocHighlight
    ): void;

    update_content(): void;
    update_position(): void;
    update_scroll(): void;
    update_layout(): void;

    // scroll(Width|Height) == oldScroll(Width|Height) && size_changed
    update_viewport(): void;

    render(): void;
};
