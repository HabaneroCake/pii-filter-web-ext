import {
    HighlightContentParser,
    Highlighter
} from './highlighter';
import { BoxHighlightRange, BoxIntensityRange } from './box-highlight-range';
import { HighlighterRangesConstructor, HighlightRange, DocHighlight } from './highlighter';

export class BoxHighlightContentParser implements HighlightContentParser
{
    protected highlighter: Highlighter;
    constructor(
        protected parse_content: (text: string, resolver: (ranges: Array<BoxIntensityRange>) => void) => void
    ) {}
    set_highlighter(highlighter: Highlighter): void
    {
        this.highlighter = highlighter;
    }
    resolve_content(
        content: string,
        resolver: (range_constructor: HighlighterRangesConstructor) => void
    ): void
    {
        this.parse_content(
            content,
            (ranges: Array<BoxIntensityRange>) => {
                resolver(
                    {
                        ranges: ranges,
                        make_highlight: (highlight_range: HighlightRange, doc_range: Range): DocHighlight => 
                        {
                            return new BoxHighlightRange(
                                highlight_range as BoxIntensityRange,
                                doc_range,
                            )
                        }
                    }
                );
            }
        );
    }
};