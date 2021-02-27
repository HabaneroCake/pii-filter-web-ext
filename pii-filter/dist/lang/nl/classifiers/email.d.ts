import * as Parsing from '../../../core/parsing';
/**
 * A simple Dutch e-mail address classifier.
 * @private
 */
export declare class EmailAddress extends Parsing.CoreAssociativeClassifier {
    /**
     * Creates a new Dutch e-mail address classifier.
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
//# sourceMappingURL=email.d.ts.map