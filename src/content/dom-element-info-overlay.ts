import { browser } from 'webextension-polyfill-ts';
import { ShadowDomDiv } from './shadow-dom-div';
import { DOMModal } from './dom-modal';
import { get_fonts } from './font_css';
/**
 * Provides an overlay with info/slider
 */

export class DOMElementInfoOverlay extends ShadowDomDiv
{
    protected severity_bar_container:   HTMLDivElement;
    protected severity_bar_indicator:   HTMLDivElement;
    protected severity_bar_text_div:    HTMLDivElement;

    protected modal_window:             DOMModal;
    protected fade_out_timer:           number;

    constructor(
        document: Document
    ) {
        super(document);
        this.modal_window = new DOMModal(document);
        this.modal_window.title_div.innerText = 'Informatie in het huidige tekstveld:';

        this.div.style.cssText = `
            transition:         0.25s ease-in;
            display:            block;
            visibility:         visible;
            position:           fixed;
            height:             0px;
            bottom:             0%;
            width:              100%;
            padding:            0px;
            border-top-style:   solid;
            border-top-width:   2px;
            border-top-color:   rgba(50, 50, 50, 1.0);
            background-color:   rgba(255, 255, 255, 0.9);
            z-index:            9999;
            opacity:            0.0;
        `;
        this.severity_bar_container = this.shadow.ownerDocument.createElement('div');
        this.severity_bar_container.style.cssText = `
            display:            block;
            visibility:         visible;
            background-image:   linear-gradient(to right, yellow, orange, red, purple);
            height:             100%;
            width:              100%;
        `;
        this.div.appendChild(this.severity_bar_container);
        this.severity_bar_indicator = this.shadow.ownerDocument.createElement('div');
        this.severity_bar_indicator.style.cssText = `
            transition:         0.75s ease-in;
            visibility:         visible;
            background-color:   rgba(255, 255, 255, 0.95);
            position:           fixed;
            height:             100%;
            right:              0%;
            width:              100%;
        `;
        this.severity_bar_container.appendChild(this.severity_bar_indicator);
        this.severity_bar_text_div = this.shadow.ownerDocument.createElement('div');
        this.severity_bar_text_div.style.cssText = `
            visibility:         visible;
            display:            flex;
            justify-content:    center;
            vertical-align:     middle;
            flex-wrap:          nowrap;
            width:              100%;
        `;

        let img_div: HTMLDivElement = this.shadow.ownerDocument.createElement('div');

        let common_style: string = `
            display:            inline-block;
            height:             25px;
            z-index:            99999;
        `
        img_div.style.cssText = common_style;

        let img: HTMLImageElement = this.shadow.ownerDocument.createElement('img');
        img.style.cssText = `
            margin-top:         2px;
            width:              15px;
            height:             15px;
            margin:             0.5px;
        `;

        img.src = browser.runtime.getURL('assets/info.png');
        img_div.appendChild(img);

        this.div.addEventListener('mouseover', ((x: GlobalEventHandlers, event: MouseEvent) => {
            this.modal_window.show();
            this.show(); // TODO keep open
        }).bind(this))

        this.div.addEventListener('mouseout', ((x: GlobalEventHandlers, event: MouseEvent) => {
            this.modal_window.hide();
        }).bind(this))

        // this.div.addEventListener('keydown', ((x: GlobalEventHandlers, event: KeyboardEvent) => {
        //     this.modal_window.show();
        //     this.show();
        //     if(event.which == 9) {
        //         event.preventDefault();
        //         event.stopPropagation();
        //     }
        // }).bind(this))

        let span_div: HTMLDivElement = this.shadow.ownerDocument.createElement('div');

        span_div.style.cssText = common_style;

        let span: HTMLSpanElement = this.shadow.ownerDocument.createElement('span');

        span.style.cssText = `
            margin-top:         4px;
            margin-right:       10px;
            height:             25px;
            font-family:        'Montserrat', sans-serif;
            font-weight:        400;
            font-size:          11t;
            color:              black;
        `;

        span.innerText = 'Persoonlijke Informatie Aanwezig';
        span_div.appendChild(span);

        this.severity_bar_text_div.appendChild(span_div);
        this.severity_bar_text_div.appendChild(img_div);
        this.severity_bar_container.appendChild(this.severity_bar_text_div);

        let style: HTMLStyleElement = this.shadow.ownerDocument.createElement('style');
        style.innerText = `
        ${get_fonts()}
        `;
        this.shadow.appendChild(style);
    }
    
    // TODO add correct fonts
    public show()
    {
        this.div.style.opacity = '1.0';
        this.div.style.height = '25px';
    }

    public hide()
    {
        this.div.style.opacity = '0.0';
        this.div.style.height = '0px';
    }

    public set severity(severity: number)
    {
        this.severity_bar_indicator.style.width = `${(1-severity) * 100}%`;
        if (severity == 0.0)
        {
            this.hide();
        }
        else
        {
            this.show();

            if (this.fade_out_timer)
                window.clearTimeout(this.fade_out_timer);
                this.fade_out_timer = window.setTimeout(() => {
                    this.hide();
                }, 10000);
        }
    }

    public set pii(all_pii: Array<[Array<string>, number?, number?]>)
    {
        this.modal_window.pii = all_pii;
    }
};