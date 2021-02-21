import {
    Highlighter,
    HighlightTextEntrySource,
    HighlightRange,
    HighlightedRange,
    DocHighlight,
    HighlightTextEntryMutationType
} from './highlighter'

import { calc_array_diff } from '../../common/array-diff';
import { HighlightTextEntryMutation } from './highlighter';

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
    update_content(mutations: Array<HighlightTextEntryMutation>): void
    {
        if (this.text_entry_source != null)
        {
            for (const mutation of mutations)
            {
                switch(mutation.type)
                {
                    case HighlightTextEntryMutationType.change:
                    {
                        // TODO: diff, for now just update all elements
                        // another cheap solution would be to compare start strings and rm everything after first diff
                        // also undo/redo etc.
                        for (const range of this.ranges)
                            range.highlight.update();
                        break;
                    }
                    case HighlightTextEntryMutationType.insert:
                    {
                        const mutation_start: number = mutation.index;
                        for (const range of this.ranges)
                        {
                            const range_start: number = range.highlight.current_range.start;
                            const range_end: number = range.highlight.current_range.end;
                            const range_within = mutation_start > range_start && mutation_start < range_end;

                            if (range_within)
                            {   //? should highlight grow like this?
                                range.highlight.update(range_start, range_end + mutation.length);
                            }
                            else if (range_start >= mutation_start)
                            {
                                range.highlight.update(range_start + mutation.length, range_end + mutation.length);
                            }
                            else //! on replacing of selection this is called twice for some elements... fix?
                                range.highlight.update();
                        }
                        break;
                    }
                    case HighlightTextEntryMutationType.remove:
                    {
                        const mutation_start: number = mutation.index;
                        const mutation_end: number = mutation.index + mutation.length;
                        this.ranges = this.ranges.filter((range: HighlightedRange, index: number,) =>
                        {
                            const range_start: number = range.highlight.current_range.start;
                            const range_end: number = range.highlight.current_range.end;

                            const start_contained = range_start >= mutation_start && range_start < mutation_end;
                            const end_contained = range_end > mutation_start && range_end <= mutation_end;
                            const range_within = mutation_start > range_start && mutation_end < range_end;
                            // TODO: insert?
                            if (start_contained && end_contained)
                            {   // range needs to be removed
                                range.highlight.remove();
                                return false;
                            }
                            else if (start_contained)
                            {   // range needs to be shortened
                                range.highlight.update(
                                    mutation_start,
                                    range_end - mutation.length
                                );
                            }
                            else if (end_contained)
                            {   // range needs to be shortened
                                range.highlight.update(
                                    range_start,
                                    mutation_start
                                );
                            }
                            else if (range_within)
                            {   // range needs to be shortened
                                range.highlight.update(
                                    range_start,
                                    range_end - mutation.length
                                );
                            }
                            else if (range_start >= mutation_end)
                            {   // offset range
                                range.highlight.update(
                                    range_start - mutation.length,
                                    range_end - mutation.length
                                );
                            }
                            else
                                range.highlight.update();
                                
                            return true;
                        });
                        console.log(this.ranges);
                        break;
                    }
                    default: break;
                }
            }
            this.render();
        }
    }

    protected update_rect()
    {
        if (this.text_entry_source != null)
        {
            this.text_entry_source.viewport_i.apply_to_element(this.viewport, true, true);
            // this.text_entry_source.viewport_o.apply_position_to_element(this.highlights, true);
            this.update_scroll();
        }
    }
    update_position(): void
    {
        console.log('position');
        this.update_rect();
    }
    update_scroll(): void
    {
        if (this.text_entry_source != null)
        {
            const [scroll_x, scroll_y] = this.text_entry_source.scroll;
            // TODO: clean up and use padding instead? or use abs pos differently
            this.highlights.style.left = `${
                -(scroll_x+this.text_entry_source.viewport_i.left-this.text_entry_source.viewport_o.left)
            }px`;
            this.highlights.style.top = `${ 
                -(scroll_y+this.text_entry_source.viewport_i.top-this.text_entry_source.viewport_o.top)
            }px`;
        }
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