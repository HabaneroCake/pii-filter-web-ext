import { ShadowDomDiv } from './shadow-dom-div';
import { get_fonts } from './font_css';

export class DOMModal extends ShadowDomDiv
{
    public title_div: HTMLDivElement;
    public content_div: HTMLDivElement;

    protected modal_wrap : HTMLDivElement;
    
    constructor(
        document: Document
    ) 
    {
        super(document);
        let style: HTMLStyleElement = this.shadow.ownerDocument.createElement('style');
        style.innerText = `
            ${get_fonts()}

            body {
                padding:            0px;
                margin:             0px;
            }
            .modal {
                transition:         0.15s ease-in-out;
                visibility:         hidden;
                position:           fixed; 
                left:               0; 
                top:                0;
                transform:          translate(0, -25px);
                width:              100%;
                height:             100%;
                background-color:   rgba(0, 0, 0, 0.5);
                z-index:            99999;
                pointer-events:     none;
            }
            .modal-wrap {
                transition:         0.15s ease-in-out;
                position:           fixed;
                width:              50%;
                left:               50%;
                top:                50%;
                transform:          translate(-50%, -50%);
                filter:             drop-shadow(0px 2px 4px #222233);
                pointer-events:     none;
            }
            .top-styling {
                min-height:         20px;
                background-color:   rgba(15, 15, 50, 0.75);
                border:             3px solid rgba(25, 25, 60, 0.75);
                color:              white;
                vertical-align:     middle;
            }
            .center-styling {
                font-family:        'Montserrat', sans-serif;
                font-weight:        300;
                font-size:          12pt;
                background-color:   rgba(255, 255, 255, 0.975);
                min-height:         40px;
                max-height:         75vh;
                overflow:           scroll;
            }
            .bottom-styling {
                font-family:        'Montserrat', sans-serif;
                font-weight:        300;
                font-size:          12pt;
                background-color:   rgba(255, 255, 255, 0.975);
                min-height:         40px;
            }
            .min-padding {
                padding:            10px;
            }
            .max-padding {
                padding:            20px;
            }
            .title {
                font-family:        'Montserrat', sans-serif;
                font-size:          15pt;
                font-weight:        900;
                color:              white;
                text-align:         center;
            }
            .modal-content {
                height:             100%;
            }
            .content {
                width:              100%;
                height:             100%;
            }
            .close-btn {
                float: right; 
                color:              rgb(150, 150, 150);
                font-size:          24px; 
                font-weight:        bold;
            }
            .close-btn:hover {
                color:              rgb(255, 255, 255);
            }
            table {
                table-layout:       fixed;
                color:              black;
                width:              100%;
                border:             2px solid rgba(225, 225, 225, 0.35);
            }
            table, td, th {
                border-collapse: collapse;
            }
            td, th {
                text-align: left;
            }
            tr {
            }
            th {
                font-family:        'Montserrat', sans-serif;
                font-size:          12pt;
                font-weight:        600;
                background-color:   rgba(245, 245, 245, 0.75);
                color:              black;
                margin-bottom:      5px;
            }
            table th {
                border-bottom:      2.0px solid rgba(0, 0, 0, 0.4); 
                border-left:        1.5px solid rgba(100, 100, 100, 0.5);
                border-right:       1.5px solid rgba(100, 100, 100, 0.5);
            }
            table tr th:first-child {
                border-left: 0;
            }
            table tr th:last-child {
                border-right: 0;
            }

            td {
                font-family:        'Montserrat', sans-serif;
                font-weight:        250;
                font-size:          12pt;
            }
            table td {
                border:             1.5px solid rgba(225, 225, 225, 0.6);
            }
            table tr:first-child td {
                border-top: 0;
            }
            table tr td:first-child {
                border-left: 0;
            }
            table tr:last-child td {
                border-bottom: 0;
            }
            table tr td:last-child {
                border-right: 0;
            }
        `;
        this.shadow.appendChild(style);
        this.div.classList.add('modal');
        this.modal_wrap = this.shadow.ownerDocument.createElement('div');
        this.modal_wrap.classList.add('modal-wrap');
        this.div.appendChild(this.modal_wrap);
        
        let modal_content_top = this.shadow.ownerDocument.createElement('div');
        modal_content_top.classList.add('modal-content', 'top-styling', 'min-padding');
        this.title_div = this.shadow.ownerDocument.createElement('div');
        this.title_div.classList.add('title');
        modal_content_top.appendChild(this.title_div);
        this.modal_wrap.appendChild(modal_content_top);

        let modal_content_center = this.shadow.ownerDocument.createElement('div');
        modal_content_center.classList.add('modal-content', 'center-styling', 'max-padding');
        this.content_div = this.shadow.ownerDocument.createElement('div');
        this.content_div.classList.add('content');
        modal_content_center.appendChild(this.content_div);
        this.modal_wrap.appendChild(modal_content_center);

        let modal_content_bottom = this.shadow.ownerDocument.createElement('div');
        modal_content_bottom.classList.add('modal-content', 'bottom-styling', 'min-padding');
        modal_content_bottom.innerText = 'Wees waakzaam met het delen van persoonlijke informatie op sociale media,'+
                                            ' webshops, blogposts en in comments en reviews.'
        this.modal_wrap.appendChild(modal_content_bottom);
        this.hide();
    }

    public set pii(all_pii: Array<[Array<string>, number?, number?]>)
    {
        // create table of personally identifiable information
        this.content_div.innerHTML = '';
        if (all_pii.length == 0)
        {
            return;
        }

        let table = this.shadow.ownerDocument.createElement('table');
        let header_row = this.shadow.ownerDocument.createElement('tr');

        for (let header of all_pii[0][0])
        {
            let col = this.shadow.ownerDocument.createElement('th');
            col.innerText = header;
            header_row.appendChild(col);
        }
        table.appendChild(header_row);

        for (let i = 1; i < all_pii.length; ++i)
        {
            let row_raw: Array<string> = all_pii[i][0];
            let [score, severity] = [all_pii[i][1], all_pii[i][2]];
            let inv_severity = (1.0 - severity) * 255;

            let row = this.shadow.ownerDocument.createElement('tr');
            row.style.background = `rgb(255, ${inv_severity}, ${inv_severity})`;

            for (let col_raw of row_raw)
            {
                let col = this.shadow.ownerDocument.createElement('td');
                col.innerText = col_raw;
                row.appendChild(col);
            }

            table.appendChild(row);
        }
        this.content_div.appendChild(table);
    }

    public show()
    {
        this.modal_wrap.style.top = '50%';
        this.div.style.opacity = '1.0';
        this.div.style.visibility = 'visible';
    }

    public hide()
    {
        this.modal_wrap.style.top = '55%';
        this.div.style.opacity = '0.0';
        this.div.style.visibility = 'hidden';
    }
};