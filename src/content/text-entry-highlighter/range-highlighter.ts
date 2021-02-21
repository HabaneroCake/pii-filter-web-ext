import {
    Highlighter,
    HighlightTextEntrySource,
    HighlightRange,
    HighlightedRange,
    DocHighlight
} from './highlighter'

import { calc_array_diff } from '../../common/array-diff';

export class RangeHighlighter implements Highlighter
{
    protected ranges:               Array<HighlightedRange> = new Array<HighlightedRange>();
    protected text_entry_source:    HighlightTextEntrySource;
    protected viewport:             HTMLDivElement;
    highlights:                     HTMLDivElement;

    remove(): void
    {
        this.remove_ranges(this.ranges);
        this.ranges = new Array<HighlightedRange>();

        if (this.viewport != null)
            this.viewport.remove();

        if (this.highlights != null)
            this.highlights.remove();
    }
    set_ranges(
        ranges: Array<HighlightRange>,
        make_highlight: (
            raw_range: HighlightRange,
            doc_range: Range
        ) => DocHighlight
    ): void
    {
        // add / remove only what is necessary
        const result = calc_array_diff<HighlightRange>(
            ranges,
            this.ranges,
            (lhs: HighlightRange, rhs: HighlightRange): boolean => {
                return lhs.start == rhs.start &&
                       lhs.end == rhs.end;
            }
        );

        console.log(this.ranges, ranges, result)

        this.remove_ranges(result.removed);
        this.add_ranges(result.added, make_highlight)
    }
    remove_ranges(elements: Array<HighlightRange>): void
    {
        for (const removed of elements)
        {
            const index: number = (this.ranges as Array<HighlightRange>).indexOf(removed);
            if (index > -1)
            {
                // remove range
                this.ranges[index].highlight.remove();
                this.ranges.splice(index, 1);
            }
        }
    }
    add_ranges(
        elements: Array<HighlightRange>,
        make_highlight: (
            raw_range: HighlightRange,
            doc_range: Range
        ) => DocHighlight
    ): void
    {
        if (this.text_entry_source != null)
        {
            let last_insert_index:  number;
            let last_element:       HighlightRange;
            if (elements.length > 0)
            {
                // insert in sorted order
                for (const added of elements)
                {
                    let i: number = (last_element != null && last_element.start <= added.start) ? last_insert_index : 0;
                    let insert_index: number;
                    for (i; i < this.ranges.length; ++i)
                    {
                        const element: HighlightRange = this.ranges[i];
                        if (element.start > added.start)
                        {
                            insert_index = i;
                            break;
                        }
                    }
                    const highlighted_range: HighlightedRange = {
                        start:      added.start,
                        end:        added.end,
                        highlight:  make_highlight(
                            added,
                            this.text_entry_source.get_range(added.start, added.end)
                        )
                    };
                    if (insert_index != null)
                        this.ranges.splice(insert_index, 0, highlighted_range);
                    else
                        this.ranges.push(highlighted_range);
                }
                this.render();
            }
        }
    }
    set_text_entry_source(text_entry_source: HighlightTextEntrySource): void
    {
        this.text_entry_source = text_entry_source;
        this.remove();

        if (this.text_entry_source != null)
        {
            this.viewport =     this.text_entry_source.document.createElement('div');
            this.highlights =   this.text_entry_source.document.createElement('div');

            this.viewport.setAttribute('style', `
                position: absolute;
                overflow: hidden;
                pointer-events: none;
            `);
            this.highlights.setAttribute('style', `
                position: absolute;
                overflow: visible;
                pointer-events: none;
            `);

            this.viewport.appendChild(this.highlights);
            this.text_entry_source.shadow.appendChild(this.viewport);
            this.update_scroll();
            this.update_layout();
        }
    }
    update_content(): void
    {
        // jsdiff
        // diff text and adjust / remove ranges (first test without this) and plan how to tackle it
        // this.render(); //?
    }

    protected update_rect()
    {
        if (this.text_entry_source != null)
        {
            this.text_entry_source.viewport_i.apply_to_element(this.viewport, true, true);
            // this.text_entry_source.viewport_o.apply_position_to_element(this.highlights, true);
            const [scroll_x, scroll_y] = this.text_entry_source.scroll;
            this.highlights.style.left = `${
                -(scroll_x+this.text_entry_source.viewport_i.left-this.text_entry_source.viewport_o.left)
            }px`;
            this.highlights.style.top = `${ 
                -(scroll_y+this.text_entry_source.viewport_i.top-this.text_entry_source.viewport_o.top)
            }px`;
        }
    }
    update_position(): void
    {
        console.log('position');
        this.update_rect()
    }
    update_scroll(): void
    {
        console.log('scroll');
        this.update_rect()
    }
    update_layout(): void
    {
        if (this.text_entry_source != null)
        {
            this.update_rect()
            this.render();
        }
    }
    render(): void
    {
        if (this.text_entry_source != null)
        {
            for (const range of this.ranges)
                range.highlight.render(this, this.text_entry_source.document);
        }
    }
};