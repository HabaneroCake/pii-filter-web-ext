import * as Parsing from '../../../core/parsing';
import { Trie } from '../../../core/structures/trie';
/**
 * A simple Dutch date classifier.
 * @private
 */
export declare class Date extends Parsing.CoreAssociativeClassifier {
    /** A word-list for matching ordinals, etc. */
    protected number_match_trie: Trie<string>;
    /**
     * Creates a new Dutch Date Classifier.
     */
    constructor();
    /** @inheritdoc */
    classify_confidence(token: Parsing.CoreToken): [
        Array<Parsing.CoreToken>,
        Parsing.CoreClassificationScore
    ];
    /** @inheritdoc */
    name: string;
}
//# sourceMappingURL=date.d.ts.map