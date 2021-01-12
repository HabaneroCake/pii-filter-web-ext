export class ShadowDomDiv
{ 
    protected root_div:     HTMLDivElement;
    protected shadow:       ShadowRoot;
    protected div:          HTMLDivElement;

    /**
    * creates a shadow div and adds it to the front of the document
    * @param document the document
    */
    constructor(
        protected document: Document
    ) {
        this.root_div = this.document.createElement("div");
        this.shadow =   this.root_div.attachShadow({mode: 'open'});
        this.div =      this.document.createElement("div");
        this.shadow.appendChild(this.div);

        document.body.insertBefore(this.root_div, this.document.body.childNodes[0]);
    }
    /**
     * set the visibility
     */
    set visibility(visible: boolean)
    {
        this.div.style.visibility = visible ? 'visible' : 'hidden';
    }
    /**
     * removes previous DOM modifications and returns null
     */
    public delete()
    {
        this.root_div.remove();
    }
};