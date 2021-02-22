import { browser } from 'webextension-polyfill-ts';
import { ShadowDomDiv } from './shadow-dom';
import { PIIFilterModalWindow } from './pii-filter-modal-window';
import { get_fonts } from './font_css';
import { Observable } from '../common/observable';
import { PIIClassification } from 'pii-filter';

// TODO: in order to toggle the modal to stay open and update as well some stuff will need to change in focus handling.

/**
 * Provides an overlay with info/slider
 */
export class PIIFilterInfoOverlay extends ShadowDomDiv
{
    protected severity_bar_container:   HTMLDivElement;
    protected severity_bar_indicator:   HTMLDivElement;
    protected severity_bar_text_div:    HTMLDivElement;

    protected severity_:                number =    0;

    protected modal_window:             PIIFilterModalWindow;
    protected fade_out_timer:           number;
    
    protected keep_open:                boolean =   false;
    protected mouse_inside:             boolean =   false;
    public hide_after_ms:               number =    10000;

    protected on_focus_required_:                Observable.Variable<boolean> = new Observable.Variable<boolean>(false);
    public on_focus_required:                    Observable<boolean> = new Observable<boolean>(this.on_focus_required_);

    constructor(
        document: Document
    ) {
        super(document);
        this.modal_window = new PIIFilterModalWindow(document);
        this.modal_window.title_div.innerText = 'Informatie in het huidige tekstveld:';

        let style: HTMLStyleElement = this.shadow.ownerDocument.createElement('style');
        style.innerText = `    
            ${get_fonts()}

            body {
                padding:            0px;
                margin:             0px;
            }
            .severity-bar-outer {
                transition:         0.25s ease-in;
                display:            block;
                visibility:         visible;
                position:           fixed;
                height:             0px;
                bottom:             0%;
                width:              100%;
                padding:            0px;
                border-top-style:   solid;
                border-top-width:   1.5px;
                border-top-color:   rgba(50, 50, 50, 0.75);
                background-color:   rgba(255, 255, 255, 0.9);
                z-index:            9999;
                opacity:            0.0;
            }
            .severity-bar-container {
                display:            block;
                background-image:   linear-gradient(to right, yellow, orange, red, purple);
                width:              100%;
                height:             25px;
            }
            .severity-bar-indicator {
                transition:         0.75s ease-in;
                visibility:         visible;
                background-color:   rgba(255, 255, 255, 0.95);
                position:           fixed;
                right:              0%;
                width:              100%;
                height:             100%;
            }
            .severity-bar-text {
                display:            flex;
                justify-content:    center;
                flex-wrap:          nowrap;
                width:              100%;
                height:             100%;
            }
            .severity-display-item {
                display:            inline-block;
                align-self:         center;
                z-index:            99999;
            }
            .severity-text-span {
                margin-right:       10px;
                font-family:        'Montserrat', sans-serif;
                font-weight:        400;
                font-size:          12pt;
                color:              black;
                align-self:         center;
            }
            .info-icon {
                margin-top:         3px;
                width:              15px;
                align-self:         center;
            }
        `;
        this.shadow.appendChild(style);
        this.div.classList.add('severity-bar-outer');
        this.severity_bar_container = this.shadow.ownerDocument.createElement('div');
        this.severity_bar_container.classList.add('severity-bar-container');
        this.div.appendChild(this.severity_bar_container);
        this.severity_bar_indicator = this.shadow.ownerDocument.createElement('div');
        this.severity_bar_indicator.classList.add('severity-bar-indicator');
        this.severity_bar_container.appendChild(this.severity_bar_indicator);
        this.severity_bar_text_div = this.shadow.ownerDocument.createElement('div');
        this.severity_bar_text_div.classList.add('severity-bar-text')

        let img_div: HTMLDivElement = this.shadow.ownerDocument.createElement('div');
        img_div.classList.add('severity-display-item');

        let img: HTMLImageElement = this.shadow.ownerDocument.createElement('img');
        img.classList.add('info-icon');

        img.src = browser.runtime.getURL('assets/info.png');
        img_div.appendChild(img);

        this.div.addEventListener('mousedown', ((x: GlobalEventHandlers, event: MouseEvent) => {
            this.keep_open = true;
            this.modal_window.show(true, ((x: GlobalEventHandlers, event: MouseEvent) => {
                this.modal_window.hide();
                this.keep_open = false;
                this.show(this.mouse_inside);
                this.on_focus_required_.value = true;
            }).bind(this));
            this.on_focus_required_.value = true;
        }).bind(this))

        this.div.addEventListener('mouseover', ((x: GlobalEventHandlers, event: MouseEvent) => {
            this.mouse_inside = true;
            if (!this.keep_open)
            {
                this.modal_window.show();
                this.show(this.mouse_inside);
            }
        }).bind(this))

        this.div.addEventListener('mouseout', ((x: GlobalEventHandlers, event: MouseEvent) => {
            if (!this.keep_open)
            {
                this.modal_window.hide();
                this.restart_fade_out_timer();
            }
            this.mouse_inside = false;
        }).bind(this))

        let span_div: HTMLDivElement = this.shadow.ownerDocument.createElement('div');
        span_div.classList.add('severity-display-item');
        let span: HTMLSpanElement = this.shadow.ownerDocument.createElement('span');
        span.classList.add('severity-text-span');
        span.innerText = 'Persoonlijke Informatie Aanwezig';
        span_div.appendChild(span);
        this.severity_bar_text_div.appendChild(span_div);
        this.severity_bar_text_div.appendChild(img_div);
        this.severity_bar_container.appendChild(this.severity_bar_text_div);

        this.hide();
    }

    public clear_fade_out_timer()
    {
        if (this.fade_out_timer)
            window.clearTimeout(this.fade_out_timer);
    }
    
    public restart_fade_out_timer()
    {
        this.clear_fade_out_timer();
        this.fade_out_timer = window.setTimeout(() => {
            this.hide();
        }, this.hide_after_ms);
    }

    public show(keep_open: boolean = false)
    {
        this.div.style.opacity =        '1.0';
        this.div.style.height =         '25px';
        this.div.style.visibility =     'visible';
        this.div.style.pointerEvents =  'auto';
        
        this.clear_fade_out_timer();
        if (!keep_open)
            this.restart_fade_out_timer();
    }

    public hide()
    {
        this.div.style.opacity =        '0.0';
        this.div.style.height =         '0px';
        this.div.style.visibility =     'hidden';
        this.div.style.pointerEvents =  'none';
        this.keep_open =                false;
        this.modal_window.hide();
    }

    public get severity()
    {
        return this.severity_;
    }

    public set severity(severity: number)
    {
        this.severity_ = severity;

        if (!this.keep_open)
        {
            this.severity_bar_indicator.style.width = `${(1-severity) * 100}%`;

            if (severity == 0.0)
                this.hide();
            else
                this.show(this.mouse_inside);
        }
    }

    public set pii(all_pii: ReadonlyArray<PIIClassification>)
    {
        if (!this.keep_open)
            this.modal_window.pii = all_pii;
    }
};