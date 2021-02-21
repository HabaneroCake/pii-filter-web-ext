import { HighlightContentParser, Highlighter, HighlightTextEntrySource, HighlightRange, DocHighlight } from './text-entry-highlighter/highlighter';
import { BoxHighlightRange } from './text-entry-highlighter/box-highlight-range';

export class PIIFilterContentParser implements HighlightContentParser
{
    protected text_entry_source: HighlightTextEntrySource;
    protected highlighter: Highlighter;

    set_highlighter(highlighter: Highlighter): void
    {
        this.highlighter = highlighter;
    }
    set_text_entry_source(text_entry_source: HighlightTextEntrySource): void
    {
        this.text_entry_source = text_entry_source;

        if (this.text_entry_source != null)
        {
            console.log(this.text_entry_source.value);
            
            this.highlighter.set_ranges(
                [{start:2, end:5}, {start: 8, end: 15}, {start: 20, end: 30}],
                (highlight_range: HighlightRange, doc_range: Range): DocHighlight => 
                {
                    return new BoxHighlightRange(
                        doc_range,
                        [255, 0, 0, 0.5]
                    )
                }
            )
        }
    }
    update_content(): void
    {
        if (this.text_entry_source != null)
            console.log(this.text_entry_source.value);
    }
};