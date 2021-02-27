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
    Highlighter,
    HighlightTextEntrySource,
    HighlightRange,
    HighlightedRange,
    DocHighlight,
    HighlightTextEntryMutationType
} from './highlighter'

import { calc_array_diff } from '../../common/array-diff';
import { HighlightTextEntryMutation, HighlightContentParser, HighlighterRangesConstructor } from './highlighter';
import { Rect } from '../../common/rect';


export class RangeHighlighter implements Highlighter
{
    protected ranges:               Array<HighlightedRange> = new Array<HighlightedRange>();
    protected content_parser:       HighlightContentParser
    protected text_entry_source:    HighlightTextEntrySource;
    protected viewport:             HTMLDivElement;
    protected highlights_viewport:  HTMLDivElement;

    protected content_id:           number;
    protected active_promise:       Promise<HighlighterRangesConstructor>;
    
    highlights:                     HTMLDivElement;
    highlights_rect_rel:            Rect = new Rect();

    set_content_parser(content_parser: HighlightContentParser): void
    {
        this.content_parser = content_parser;
    }

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

        this.active_promise = null;
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
    clear(): void
    {
        for (const range of this.ranges)
            range.highlight.remove();
        this.ranges = new Array<HighlightedRange>();
    }
    set_ranges(ranges_constructor: HighlighterRangesConstructor, adjust_overlapping_ranges: boolean=false): void
    {
        // add / remove only what is necessary
        const result = calc_array_diff<HighlightRange>(
            ranges_constructor.ranges,
            this.ranges,
            (lhs: HighlightRange, rhs: HighlightRange): boolean => {
                return lhs.start == rhs.start &&
                       lhs.end == rhs.end;
            }
        );

        this.remove_ranges(result.removed, false);
        this.add_ranges(
            {
                ranges: result.added, 
                make_highlight: ranges_constructor.make_highlight
            }, 
            false
        );

        if (adjust_overlapping_ranges)
        {
            for (let range of result.overlap)
            {
                const index: number = this.ranges.findIndex((value: HighlightedRange) => {
                    return value.start == range.start && value.end == range.end;
                });
                if (index > -1)
                {
                    range.start =   this.ranges[index].highlight.current_range.start;
                    range.end =     this.ranges[index].highlight.current_range.end;
                }
            }
        }

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
        ranges_constructor: HighlighterRangesConstructor,
        render: boolean=true
    ): void
    {
        if (this.text_entry_source != null)
        {
            const text_len: number = this.text_entry_source.value.length;
            let last_insert_index:  number;
            let last_element:       HighlightRange;
            if (ranges_constructor.ranges.length > 0)
            {
                // insert in sorted order
                for (const added of ranges_constructor.ranges)
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
                        highlight:  ranges_constructor.make_highlight(
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
        this.remove();
        
        this.content_id =           0;
        this.text_entry_source =    text_entry_source;

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
                z-index: 99999;
            `);
            this.highlights.setAttribute('style', `
                display: block;
                position: absolute;
                overflow: visible;
                visibility: visible;
                pointer-events: none;
                z-index: 99999;
            `);

            this.highlights_viewport.appendChild(this.highlights);
            this.viewport.appendChild(this.highlights_viewport);
            this.text_entry_source.shadow.appendChild(this.viewport);
            this.update_scroll();
            this.update_layout();
            this.stage_new_content();
        }
    }
    update_content(mutations: Array<HighlightTextEntryMutation>): void
    { // TODO: optimize
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
                        break;
                    }
                    default: break;
                }
            }
            this.render();
            this.stage_new_content();
        }
    }

    protected stage_new_content()
    {
        this.content_id++;
        if (this.text_entry_source != null && this.active_promise == null)
        {
            const stage_id: number = this.content_id;
            const source: HighlightTextEntrySource = this.text_entry_source;
            // sync adjusted range values for comparison on return
            for (let range of this.ranges)
            {
                range.start =   range.highlight.current_range.start;
                range.end =     range.highlight.current_range.end;
            }
            this.active_promise = new Promise<HighlighterRangesConstructor>(
                (resolve: (ranges_constructor: HighlighterRangesConstructor) => void): void => 
                { 
                    this.content_parser.resolve_content(
                        this.text_entry_source.value,
                        (ranges_constructor: HighlighterRangesConstructor) => {
                            resolve(ranges_constructor);
                        }
                    );
                }
            );
            this.active_promise.then(
                (ranges_constructor: HighlighterRangesConstructor) =>
                {
                    (async () => {
                        this.active_promise = null;
                        if (this.text_entry_source === source)
                        {
                            this.set_ranges(ranges_constructor, true);
                            if (stage_id != this.content_id)
                            {   // recurse
                                this.stage_new_content();
                            }
                            return ranges_constructor;
                        }
                    })();
                }, 
                (reason: any) => 
                { //? necessary?

                }
            )
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
            // this.highlights_viewport.style.backgroundColor = 'rgba(0, 255, 0, 0.4)';
            // this.text_entry_source.viewport_o.apply_position_to_element(this.highlights, true);
            this.update_scroll();
        }
    }
    async update_position(): Promise<void>
    {
        this.update_rect();
    }

    // only render once scroll has settled
    protected scroll_update_timeout: number;
    protected rendering_scroll: Promise<void>;
    async update_scroll(): Promise<void>
    {
        const render_scroll = () =>
        {
            const [scroll_x, scroll_y] = this.text_entry_source.scroll;
            return this.render().then(
                () => {
                    this.rendering_scroll = null;
                    if (this.text_entry_source != null)
                    {
                        const [new_scroll_x, new_scroll_y] = this.text_entry_source.scroll;
                        if (new_scroll_x != scroll_x || new_scroll_y != scroll_y)
                        {   // recurse
                            this.update_scroll();
                        }
                    }
                },
            )
        };
        
        if (this.text_entry_source != null)
        {
            if (this.scroll_update_timeout != null)
                window.clearTimeout(this.scroll_update_timeout);
            
            this.scroll_update_timeout = window.setTimeout(() => {
                if (this.rendering_scroll == null)
                    this.rendering_scroll = render_scroll();
            }, 500);

            const [scroll_x, scroll_y] = this.text_entry_source.scroll;
            this.highlights.style.left = `${-scroll_x}px`;
            this.highlights.style.top = `${-scroll_y}px`;
        }
    }
    async update_layout(): Promise<void>
    {
        if (this.text_entry_source != null)
        {
            this.update_rect()
            this.render();
        }
    }
    // protected last_visible_range: [number, number] = [0, 0];
    async render(): Promise<void>
    { // TODO: clean up and use different data structure 
        // const rect_intersects_vp = (rect: DOMRect) =>
        // {
        //     const [scroll_x, scroll_y] = this.text_entry_source.scroll;
        //     return (!(rect.bottom - scroll_y < this.highlights_rect_rel.top ||
        //         rect.top - scroll_y >  this.highlights_rect_rel.bottom ||
        //         rect.left - scroll_x > this.highlights_rect_rel.right ||
        //         rect.right - scroll_x < this.highlights_rect_rel.left));
        // }

        // if (this.text_entry_source != null)
        // {
        //     const ranges_len: number = this.ranges.length;
        //     let range_extent: [number, number] = [
        //         Math.min(this.last_visible_range[0], ranges_len-1),
        //         Math.min(this.last_visible_range[1], ranges_len-1)
        //     ]

        //     // scroll direction?
        //     const new_ranges: [number, number] = [null, null];
        //     const middle_index: number = range_extent[0] + Math.round((range_extent[1]-range_extent[0]) / 2)
        //     for (let i: number = 0; i < ranges_len; ++i)
        //     {
        //         const left_index: number = middle_index - i;
        //         const right_index: number = middle_index + i;
        //         let left_range: HighlightedRange, right_range: HighlightedRange;
        //         if (left_index >= 0)
        //         {
        //             left_range = this.ranges[left_index];
        //             const range_rect: DOMRect = left_range.highlight.document_range.getBoundingClientRect();
        //             if (rect_intersects_vp(range_rect))
        //             {
        //                 new_ranges[0] = new_ranges[0] == null ? left_index : Math.min(new_ranges[0], left_index);
        //                 new_ranges[1] = new_ranges[1] == null ? left_index : Math.max(new_ranges[1], left_index);
        //                 left_range.highlight.render(this, this.text_entry_source.document, range_rect);
        //             }
        //         }
        //         if (right_index < ranges_len)
        //         {
        //             right_range = this.ranges[right_index];
        //             const range_rect: DOMRect = right_range.highlight.document_range.getBoundingClientRect();
        //             if (rect_intersects_vp(range_rect))
        //             {
        //                 new_ranges[0] = new_ranges[0] == null ? right_index : Math.min(new_ranges[0], right_index);
        //                 new_ranges[1] = new_ranges[1] == null ? right_index : Math.max(new_ranges[1], right_index);
        //                 right_range.highlight.render(this, this.text_entry_source.document, range_rect);
        //             }
        //         }
        //         if (new_ranges[0] != null && new_ranges[1] != null &&
        //             left_range == null && right_range == null)
        //             break;
        //     }
        //     if (new_ranges[0] != null && new_ranges[1] != null)
        //     {
        //         // todo optimize this
        //         for (let i: number = this.last_visible_range[0];
        //              i < Math.min(this.last_visible_range[1] + 1, ranges_len); ++i)
        //         {
        //             if (i < new_ranges[0] || i > new_ranges[1])
        //                 this.ranges[i].highlight.remove();
        //         }
        //         this.last_visible_range = new_ranges;
        //     }

            // remove last visible range
            
            // console.log(this.last_visible_range)

            // update before range and set limit

            // update range and check if there is limit

            // update after range and set limit
        if (this.text_entry_source != null)
        {
            for (const range of this.ranges)
            {
                const [scroll_x, scroll_y] = this.text_entry_source.scroll;
                const range_rect: DOMRect = range.highlight.document_range.getBoundingClientRect();
                // if (!(range_rect.bottom - scroll_y < this.highlights_rect_rel.top ||
                //     range_rect.top - scroll_y >  this.highlights_rect_rel.bottom ||
                //     range_rect.left - scroll_x > this.highlights_rect_rel.right ||
                //     range_rect.right - scroll_x < this.highlights_rect_rel.left))
                {
                    range.highlight.render(this, this.text_entry_source.document, range_rect);
                }
                // else
                // {
                //     range.highlight.remove();
                // }
            }
        }
    }
};