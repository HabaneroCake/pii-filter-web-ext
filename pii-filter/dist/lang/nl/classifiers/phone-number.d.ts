import * as Parsing from '../../../core/parsing';
/**
 * A simple phone number classifier.
 * @private
 */
export declare class PhoneNumber extends Parsing.CoreAssociativeClassifier {
    /**
     * Creates a new Dutch phone number classifier.
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
//# sourceMappingURL=phone-number.d.ts.map