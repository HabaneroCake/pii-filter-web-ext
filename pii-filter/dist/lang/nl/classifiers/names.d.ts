import * as Parsing from '../../../core/parsing';
/**
 * The Dutch dictionary.
 * @private
 */
export declare class Dictionary extends Parsing.CoreDictionary {
    /**
     * Creates a new Dutch dictionary.
     */
    constructor();
    /** @inheritdoc */
    name: string;
}
/**
 * A Dutch first name classifier.
 * @private
 */
export declare class FirstName extends Parsing.CoreMultiNameClassifier {
    /**
     * Creates a new first name classifier.
     */
    constructor();
    /** @inheritdoc */
    name: string;
}
/**
 * A Dutch family name classifier.
 * @private
 */
export declare class FamilyName extends Parsing.CoreMultiNameClassifier {
    /**
     * Creates a new family name classifier.
     */
    constructor();
    /** @inheritdoc */
    name: string;
}
/**
 * A Dutch pet name classifier.
 * @private
 */
export declare class PetName extends Parsing.CoreNameClassifier {
    /**
     * Creates a new pet name classifier.
     */
    constructor();
    /** @inheritdoc */
    name: string;
}
/**
 * A Dutch medicine name classifier.
 * @private
 */
export declare class MedicineName extends Parsing.CoreNameClassifier {
    /**
     * Creates a new medicine name classifier.
     */
    constructor();
    /** @inheritdoc */
    name: string;
}
//# sourceMappingURL=names.d.ts.map