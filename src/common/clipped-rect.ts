export class ClippedRect
{
    constructor(
        public readonly left:               number,
        public readonly left_clipped:       boolean,
        public readonly right:              number,
        public readonly right_clipped:      boolean,
        public readonly top:                number,
        public readonly top_clipped:        boolean,
        public readonly bottom:             number,
        public readonly bottom_clipped:     boolean,
        public readonly width:              number,
        public readonly height:             number,
    ) {}
};