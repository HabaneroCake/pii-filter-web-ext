export class ShadowDom
{ 
    public root_div:        HTMLDivElement;
    public shadow:          ShadowRoot;

    /**
    * creates a shadow div and adds it to the front of the document
    * @param document the document
    */
    constructor(
        protected document: Document,
        insert_at:      Element = document.body.children[0], // TODO: what if this is empty?
        insert_after:   boolean = false
    ) {
        this.root_div = this.document.createElement("div");
        this.shadow =   this.root_div.attachShadow({mode: 'open'});

        if (insert_after)
            insert_at.insertAdjacentElement('afterend', this.root_div);
        else
            insert_at.insertAdjacentElement('beforebegin', this.root_div);
    }
    /**
     * removes previous DOM modifications and returns null
     */
    public delete()
    {
        this.root_div.remove();
    }
};

export class ShadowDomDiv extends ShadowDom
{ 
    public root_div:        HTMLDivElement;
    public shadow:          ShadowRoot;
    public div:             HTMLDivElement;

    /**
    * creates a shadow div and adds it to the front of the document
    * @param document the document
    */
    constructor(
        protected document: Document,
        insert_at:      Element = document.body.children[0], // TODO: what if this is empty?
        insert_after:   boolean = false
    ) {
        super(document, insert_at, insert_after);
        this.div =      this.document.createElement("div");
        this.shadow.appendChild(this.div);
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
        super.delete();
    }
};