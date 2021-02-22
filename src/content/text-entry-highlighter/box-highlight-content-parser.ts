import {
    HighlightContentParser,
    Highlighter,
    HighlightTextEntrySource,
    HighlightRange,
    DocHighlight,
    HighlightTextEntryMutation 
} from './highlighter';
import { BoxHighlightRange, BoxIntensityRange } from './box-highlight-range';

export class BoxHighlightContentParser implements HighlightContentParser
{
    protected text_entry_source: HighlightTextEntrySource;
    protected highlighter: Highlighter;
    constructor(
        protected content_updated: (text: string) => void
    ) {}
    set_highlighter(highlighter: Highlighter): void
    {
        this.highlighter = highlighter;
    }
    set_text_entry_source(text_entry_source: HighlightTextEntrySource): void
    {
        this.text_entry_source = text_entry_source;
        if (this.text_entry_source != null)
            this.content_updated(this.text_entry_source.value);
    }
    update_content(mutations: Array<HighlightTextEntryMutation>): void
    {
        if (this.text_entry_source != null)
            this.content_updated(this.text_entry_source.value);
    }
    set_ranges(ranges: Array<BoxIntensityRange>)
    {
        if (this.text_entry_source != null)
        {
            this.highlighter.set_ranges(
                ranges,
                (highlight_range: HighlightRange, doc_range: Range): DocHighlight => 
                {
                    return new BoxHighlightRange(
                        highlight_range as BoxIntensityRange,
                        doc_range,
                    )
                }
            )
        }
    }
};