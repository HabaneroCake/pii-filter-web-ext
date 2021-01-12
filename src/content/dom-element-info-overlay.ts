import { ShadowDomDiv } from './shadow-dom-div';
/**
 * Provides an overlay with info/slider
 */

export class DOMElementInfoOverlay extends ShadowDomDiv
{
    protected severity_bar_container:  HTMLDivElement;
    protected severity_bar_indicator:  HTMLDivElement;
    protected severity_bar_text_div:   HTMLDivElement;

    protected fade_out_timer:          number;

    constructor(
        document: Document
    ) {
        super(document);
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
            font-family:        'Courier New', Courier, monospace;
            visibility:         visible;
            position:           fixed;
            text-align:         center;
            height:             25px;
            line-height:        25px;
            width:              100%;
            color:              black;
        `;
        this.severity_bar_text_div.innerText = 'Sensitive Information Indicator [i]';
        this.severity_bar_container.appendChild(this.severity_bar_text_div);
    }

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

    public set pii(all_pii: Array<string>)
    {
        let tooltip_txt: string = 'Information found: \n\n';
        for (let pii of all_pii)
            tooltip_txt += pii + '\n';
        this.severity_bar_text_div.title = tooltip_txt;
    }
};