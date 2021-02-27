import { CoreAssociations } from './classification';
/**
 * @inheritdoc Token
 * @private
 */
export class CoreToken {
    /**
     * Creates a new CoreToken.
     * @param symbol the original string symbol
     * @param stem the stemmed symbol
     * @param tag the POSInfo tag
     * @param index the token index
     * @param c_index_start the start index in characters
     * @param c_index_end the end index in characters
     */
    constructor(symbol, stem, tag, index, c_index_start, c_index_end) {
        this.symbol = symbol;
        this.stem = stem;
        this.tag = tag;
        this.index = index;
        this.c_index_start = c_index_start;
        this.c_index_end = c_index_end;
        /** @inheritdoc */
        this.previous = null;
        /** @inheritdoc */
        this.next = null;
        /** @inheritdoc */
        this.confidences_associative = new CoreAssociations();
        /** @inheritdoc */
        this.confidences_classification = new Array();
    }
}
;
//# sourceMappingURL=token.js.map