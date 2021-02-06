import { Rect } from './rect';

export class ClippedRect extends Rect
{
    constructor(
        left:                       number,
        public left_clipped:        boolean,
        public right_clipped:       boolean,
        top:                        number,
        public top_clipped:         boolean,
        public bottom_clipped:      boolean,
        width:                      number,
        height:                     number,
    )
    {
        super(left, top, width, height);
    }
};