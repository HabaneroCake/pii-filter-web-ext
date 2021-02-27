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

import { Rect } from '../../common/rect';
import { Highlighter, HighlightTextEntrySource } from './highlighter';
import { Bindings } from './bindings';
import { ElementObserver } from '../element_observer';

export abstract class AbstractHighlightTextEntrySource implements HighlightTextEntrySource
{
    value:                      string =                '';
    document:                   Document;
    shadow:                     ShadowRoot;
    highlighter:                Highlighter;
    scroll:                     [number, number] =      [0, 0];
    rect:                       Rect =                  new Rect();
    viewport_o:                 Rect =                  new Rect();
    viewport_i:                 Rect =                  new Rect();

    protected bindings:         Bindings =              new Bindings();
    protected element_observer: ElementObserver;

    constructor(
        protected element: HTMLElement,
        protected polling_interval: number
    ) {}


    //! TODO: only allow init once
    init(
        document: Document,
        shadow: ShadowRoot,
        highlighter: Highlighter
    ): void
    {
        this.document =         document;
        this.shadow=            shadow;
        this.highlighter =      highlighter;
        this.on_init();

        let last_rect: Rect =   new Rect();
        this.element_observer = new ElementObserver(
            document,
            shadow,
            this.element,
            this.polling_interval,
            (rect: Rect) => {
                const pos_changed: boolean = (
                    rect.left_absolute != last_rect.left_absolute ||
                    rect.top_absolute != last_rect.top_absolute
                );  
                const size_changed: boolean = (
                    rect.width != last_rect.width ||
                    rect.height != last_rect.height ||
                    rect.scroll_width != last_rect.scroll_width ||
                    rect.scroll_height != last_rect.scroll_height
                );
                this.on_rect_changed(rect, pos_changed, size_changed);
                last_rect = rect;
            },
            (changes: Map<string, string>, all: Map<string, string>) => { this.on_style_changed(changes, all); },
        );
        this.highlighter.set_text_entry_source(this);
    }
    abstract get_range(start_index: number, end_index: number): Range;
    protected abstract on_init(): void;
    protected abstract on_rect_changed(rect: Rect, position_changed: boolean, size_changed: boolean): void;
    protected abstract on_style_changed(changes: Map<string, string>, all: Map<string, string>): void;

    remove(): void
    {
        this.element_observer.remove();
        this.bindings.remove();
        this.highlighter.set_text_entry_source(null);
    }
};