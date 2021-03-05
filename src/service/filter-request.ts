export class FilterRequest
{
    constructor(
        public readonly text:       string,
        public readonly tab:        number,
        public readonly frame:      number
    ){}
}