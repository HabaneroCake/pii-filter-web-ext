import { Associations, ClassificationScore, Confidences } from '../interfaces/parsing/classification';
import { POSInfo } from '../interfaces/parsing/tagging';
import { Token } from '../interfaces/parsing/tokens';
/**
 * @inheritdoc Token
 * @private
 */
export declare class CoreToken implements Token {
    symbol: string;
    stem: string;
    tag: POSInfo;
    index: number;
    c_index_start: number;
    c_index_end: number;
    /** @inheritdoc */
    previous: Token;
    /** @inheritdoc */
    next: Token;
    /** @inheritdoc */
    confidence_dictionary: ClassificationScore;
    /** @inheritdoc */
    confidences_associative: Associations;
    /** @inheritdoc */
    confidences_classification: Array<Confidences>;
    /**
     * Creates a new CoreToken.
     * @param symbol the original string symbol
     * @param stem the stemmed symbol
     * @param tag the POSInfo tag
     * @param index the token index
     * @param c_index_start the start index in characters
     * @param c_index_end the end index in characters
     */
    constructor(symbol: string, stem: string, tag: POSInfo, index: number, c_index_start: number, c_index_end: number);
}
//# sourceMappingURL=token.d.ts.map