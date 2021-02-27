// Text highlighting utilities for textarea, input, and contenteditable elements
// Copyright (C) 2021 habanerocake

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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