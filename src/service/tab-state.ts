export class FocusedFrame {
    constructor(
        public readonly frame:  number = null
    )
    {}

    get valid(): boolean
    {
        return this.frame != null;
    }

    public equal(frame: number)
    {
        return this.frame == frame;
    }
}

export class TabState {
    public last_focused:        FocusedFrame = new FocusedFrame();
    public restorable_focus:    FocusedFrame = new FocusedFrame();

    public has_focused(frame: number)
    {
        return this.last_focused.equal(frame) ||
                this.restorable_focus.equal(frame);
    }
    public reset_focus()
    {
        this.last_focused =         new FocusedFrame();
        this.restorable_focus =     new FocusedFrame();
    }
    public clear_last_focus()
    {
        if (this.last_focused.valid)
            this.last_focused = new FocusedFrame();
    }
    public set_focus(frame: number)
    {
        const new_frame = new FocusedFrame(frame);
        this.last_focused = new_frame;
        this.restorable_focus = new_frame;
    }
};