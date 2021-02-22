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
import { Rect } from '../../common/rect';


// import { DOMRectHighlight } from '../../../../../underlines/test';

export class RangeHighlighter implements Highlighter
{
    protected ranges:               Array<HighlightedRange> = new Array<HighlightedRange>();
    protected text_entry_source:    HighlightTextEntrySource;
    protected viewport:             HTMLDivElement;
    protected highlights_viewport:  HTMLDivElement;
    highlights:                     HTMLDivElement;
    highlights_rect_rel:                Rect = new Rect();

    // protected t_highlight:              DOMRectHighlight;

    remove(): void
    {
        this.remove_ranges(this.ranges);
        this.ranges = new Array<HighlightedRange>();

        if (this.viewport != null)
        {
            this.viewport.remove();
            this.viewport = null;
        }

        if (this.highlights_viewport != null)
        {
            this.highlights_viewport.remove();
            this.highlights_viewport = null;
        }

        if (this.highlights != null)
        {
            this.highlights.remove();
            this.highlights = null;
        }
    }
    update_ranges(ranges: Array<HighlightRange>, render: boolean=true): void
    {
        for (const range of ranges)
        {
            const index: number = this.ranges.findIndex((value: HighlightedRange) => {
                return value.start == range.start && value.end == range.end;
            });
            if (index > -1)
                this.ranges[index].highlight.update_range(range);
        }
        if (render)
            this.render();
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

        this.remove_ranges(result.removed, false);
        this.add_ranges(result.added, make_highlight, false)
        this.update_ranges(result.overlap, false);
        this.render();
    }
    remove_ranges(ranges: Array<HighlightRange>, render: boolean=true): void
    {
        for (const removed of ranges)
        {
            const index: number = (this.ranges as Array<HighlightRange>).indexOf(removed);
            if (index > -1)
            {
                // remove range
                this.ranges[index].highlight.remove();
                this.ranges.splice(index, 1);
            }
        }
        if (render)
            this.render();
    }
    add_ranges(
        elements: Array<HighlightRange>,
        make_highlight: (
            raw_range: HighlightRange,
            doc_range: Range
        ) => DocHighlight,
        render: boolean=true
    ): void
    {
        if (this.text_entry_source != null)
        {
            const text_len: number = this.text_entry_source.value.length;
            let last_insert_index:  number;
            let last_element:       HighlightRange;
            if (elements.length > 0)
            {
                // insert in sorted order
                for (const added of elements)
                {
                    // skip invalid ranges
                    if (added.start < 0 ||
                        added.end < 0 ||
                        added.end < added.start ||
                        added.start >= text_len ||
                        added.end > text_len)
                        continue;

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
                if (render)
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
            this.viewport =                 this.text_entry_source.document.createElement('div');
            this.highlights_viewport =      this.text_entry_source.document.createElement('div');
            this.highlights =               this.text_entry_source.document.createElement('div');

            this.viewport.setAttribute('style', `
                display: block;
                position: absolute;
                overflow: hidden;
                visibility: hidden;
                pointer-events: none;
            `);
            this.highlights_viewport.setAttribute('style', `
                display: block;
                position: absolute;
                overflow: hidden;
                visibility: hidden;
                pointer-events: none;
            `);
            this.highlights.setAttribute('style', `
                display: block;
                position: absolute;
                overflow: visible;
                visibility: visible;
                pointer-events: none;
            `);

            this.highlights_viewport.appendChild(this.highlights);
            this.viewport.appendChild(this.highlights_viewport);
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
                            range.highlight.adjust_range();
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
                                range.highlight.adjust_range(range_start, range_end + mutation.length);
                            }
                            else if (range_start >= mutation_start)
                            {
                                range.highlight.adjust_range(range_start + mutation.length, range_end + mutation.length);
                            }
                            else //! on replacing of selection this is called twice for some elements... fix?
                                range.highlight.adjust_range();
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
                                range.highlight.adjust_range(
                                    mutation_start,
                                    range_end - mutation.length
                                );
                            }
                            else if (end_contained)
                            {   // range needs to be shortened
                                range.highlight.adjust_range(
                                    range_start,
                                    mutation_start
                                );
                            }
                            else if (range_within)
                            {   // range needs to be shortened
                                range.highlight.adjust_range(
                                    range_start,
                                    range_end - mutation.length
                                );
                            }
                            else if (range_start >= mutation_end)
                            {   // offset range
                                range.highlight.adjust_range(
                                    range_start - mutation.length,
                                    range_end - mutation.length
                                );
                            }
                            else
                                range.highlight.adjust_range();
                                
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
            this.text_entry_source.viewport_o.apply_to_element(this.viewport, true, true);
            const pd_left: number = this.text_entry_source.viewport_i.left - this.text_entry_source.viewport_o.left;
            const pd_top: number = this.text_entry_source.viewport_i.top - this.text_entry_source.viewport_o.top;
            const width_i: number = this.text_entry_source.viewport_i.width;
            const height_i: number = this.text_entry_source.viewport_i.height;

            this.highlights_rect_rel.left = pd_left;
            this.highlights_rect_rel.top = pd_top;
            this.highlights_rect_rel.width = width_i;
            this.highlights_rect_rel.height = height_i;

            this.highlights_viewport.style.left =   `${pd_left}px`;
            this.highlights_viewport.style.top =    `${pd_top}px`;
            this.highlights_viewport.style.width =  `${width_i}px`;
            this.highlights_viewport.style.height = `${height_i}px`;

            // this.text_entry_source.viewport_i.apply_to_element(this.highlights_viewport, true, true);
            this.highlights_viewport.style.backgroundColor = 'rgba(0, 255, 0, 0.4)';
            // if (this.t_highlight != null)
            //     this.t_highlight.remove();

            // this.t_highlight = new DOMRectHighlight(document, this.text_entry_source.viewport_i, 2);
            // this.t_highlight.color = [0, 255, 0, 1.0];
            // this.text_entry_source.viewport_o.apply_position_to_element(this.highlights, true);
            this.update_scroll();
        }
    }
    update_position(): void
    {
        this.update_rect();
    }
    update_scroll(): void
    {
        if (this.text_entry_source != null)
        {
            const [scroll_x, scroll_y] = this.text_entry_source.scroll;
            this.highlights.style.left = `${-scroll_x}px`;
            this.highlights.style.top = `${-scroll_y}px`;
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
            {
                range.highlight.document_range = this.text_entry_source.get_range(
                    range.highlight.current_range.start,
                    range.highlight.current_range.end
                )
                range.highlight.render(this, this.text_entry_source.document);
            }
        }
    }
};