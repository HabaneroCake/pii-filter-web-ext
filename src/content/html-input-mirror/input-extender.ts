import { ShadowDomDiv } from '../shadow-dom-div';
import { Bindings } from '../bindings';

// currently only works for 1 input at a time

export interface InputInterfaceSettings
{
    document:   Document;
    element:    HTMLElement;
    on_blur?:   (event: Event) => void;
};

export abstract class AbstractInputInterface extends ShadowDomDiv
{
    
    // add range display stuff here as well

    constructor(protected settings: InputInterfaceSettings)
    {
        super(settings.document, settings.element);
    }

    public abstract contains(element: HTMLElement): boolean;
};

export class TextAreaInputInterface extends AbstractInputInterface
{
    protected bindings: Bindings = new Bindings();
    protected _element: Element;

    constructor(settings: InputInterfaceSettings)
    {
        super(settings);

        // add old bindings
        if (this._element != null)
            this.bindings.delete();
        
        // if (this.overlay != null)
        // add new bindings
        

        this.bindings.bind_event(this._overlay, 'blur', (event: Event) => {
            if (this.settings.on_blur != null)
                this.settings.on_blur(event);
        });

    };

    public contains(element: HTMLElement): boolean
    {
        throw new Error('unimpl');
    }
};

export class PIIFilterInputExtender
{
    protected bindings: Bindings = new Bindings();
    protected input_interface: AbstractInputInterface;

    constructor(main_document: Document)
    {
        // catch focus
        this.bindings.bind_event(document, 'focusin', (event: Event) => {
            const target_element: HTMLElement = event.target as HTMLElement;

            // ignore if target is part of input interface
            if (this.input_interface != null && this.input_interface.contains(target_element))
                return;

            // TODO: keep old interface if it is of same type

            const on_blur = (event: Event) =>
            {
                // todo other stuff (check if this is because of other overlay)
                this.delete_interface();
            };

            // delete old interface 
            this.input_interface.delete();

            const settings: InputInterfaceSettings = {
                document:   document,
                element:    target_element,
                on_blur:    on_blur
            };

            if (target_element.nodeName == 'INPUT')
                return
            else if (target_element.nodeName == 'TEXTAREA')
                this.input_interface = new TextAreaInputInterface(settings);
            else if (target_element.isContentEditable)
                return
            else
                return;
        });


        // catch input / clicking / polling
    }

    public delete_interface()
    {
        if (this.input_interface != null)
        {
            this.input_interface.delete();
            this.input_interface = null;
        }
    }

    public delete()
    {
        this.bindings.delete();
    }
};