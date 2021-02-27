import { Classifier, Classification, ClassificationScore, AssociativeScore, AssociationScore } from '../interfaces/parsing/classification';
import { Language } from '../interfaces/language';
import { Token } from '../../core/interfaces/parsing/tokens';
import { Associations, Confidences, Thresholds, ThresholdSetting } from '../interfaces/parsing/classification';
/**
 * @inheritdoc Classifier
 * @private
 */
export declare abstract class CoreClassifier implements Classifier {
    /** @inheritdoc */
    language_model: Language;
    /** @inheritdoc */
    associative_references: Array<[Classifier, CoreAssociativeScore]>;
    /** @inheritdoc */
    init(language_model: Language): void;
    /** @inheritdoc */
    abstract classify_associative(token: Token): [Array<Token>, AssociationScore];
    /** @inheritdoc */
    abstract classify_confidence(token: Token): [Array<Token>, ClassificationScore];
    /** @inheritdoc */
    abstract name: string;
}
/**
 * @inheritdoc Classification
 * @private
 */
export declare class CoreClassification implements Classification {
    classifier: Classifier;
    group_root_start: Token;
    group_root_end: Token;
    /**
     * Creates a new CoreClassification.
     * @param classifier the classifier which was used
     */
    constructor(classifier: Classifier);
    /** @inheritdoc Classification.valid */
    valid(): boolean;
}
/**
 * @inheritdoc ClassificationScore
 * @private
 */
export declare class CoreClassificationScore extends CoreClassification implements ClassificationScore {
    score: number;
    severity: number;
    /**
     * Creates a new CoreClassificationScore.
     * @param score the confidence score
     * @param severity the severity score
     * @param classifier the classifier which was used
     */
    constructor(score: number, severity: number, classifier: Classifier);
}
/**
 * @inheritdoc AssociativeScore
 * @private
 */
export declare class CoreAssociativeScore implements AssociativeScore {
    left_max: number;
    right_max: number;
    score: number;
    severity: number;
    /**
     * Creates a new CoreAssociativeScore.
     * @param left_max the maximum distance from the left that a classification may use this association
     * @param right_max the maximum distance from the right that a classification may use this association
     * @param score the amount of confidence it adds
     * @param severity the amount of severity it adds
     */
    constructor(left_max: number, right_max: number, score: number, severity: number);
}
/**
 * @inheritdoc AssociationScore
 * @private
 */
export declare class CoreAssociationScore extends CoreClassificationScore implements AssociationScore {
    associative_score: AssociativeScore;
    /**
     * Creates a new CoreAssociationScore.
     * @param associative_score the associative score
     * @param score the amount of confidence it adds
     * @param severity the amount of severity it adds
     * @param classifier the classifier which provided this match
     */
    constructor(associative_score: AssociativeScore, // global
    score: number, // can be adjusted
    severity: number, // can be adjusted
    classifier: Classifier);
    /** @inheritdoc */
    valid_from_left(distance_from_left: number, n_phrase_endings: number): boolean;
    /** @inheritdoc */
    valid_from_right(distance_from_right: number, n_phrase_endings: number): boolean;
}
/**
 * @inheritdoc Associations
 * @private
 */
export declare class CoreAssociations implements Associations {
    /** the raw associations */
    protected assoc_map: Map<Classifier, Array<AssociationScore>>;
    /** @inheritdoc */
    add(classifier: Classifier, association_score: AssociationScore): void;
    /** @inheritdoc */
    has(classifier: Classifier): boolean;
    /** @inheritdoc */
    get(classifier: Classifier): Array<AssociationScore>;
    /** @inheritdoc */
    max(classifier: Classifier): AssociationScore;
    /** @inheritdoc */
    values(): IterableIterator<Array<AssociationScore>>;
}
/**
 * @inheritdoc Confidences
 * @private
 */
export declare class CoreConfidences implements Confidences {
    /** the raw confidences */
    private confidences;
    /** @inheritdoc */
    add(classification_score: ClassificationScore): void;
    /** @inheritdoc */
    max(): ClassificationScore;
    /** @inheritdoc */
    all(): ReadonlyArray<ClassificationScore>;
}
/**
 * @inheritdoc Thresholds
 * @private
 */
export declare class CoreThresholds implements Thresholds {
    well_formedness_threshold: number;
    well_formed: ThresholdSetting;
    ill_formed: ThresholdSetting;
    /**
     * Creates a new CoreThresholds.
     * @param well_formedness_threshold the threshold for text to be 'well-formed'
     * @param well_formed the settings for 'well-formed' text
     * @param ill_formed the settings for 'ill-formed' text
     */
    constructor(well_formedness_threshold: number, well_formed: ThresholdSetting, ill_formed: ThresholdSetting);
    /** @inheritdoc */
    validate(classification: ClassificationScore, well_formed?: boolean): boolean;
}
/**
 * @private
 */
export declare namespace CoreThresholds {
    /**
     * @inheritdoc ThresholdSetting
     * @private
     */
    class Group implements ThresholdSetting {
        min_classification_score: number;
        min_severity_score: number;
        compare_against_dict_score: boolean;
        /**
         * Creates a new CoreThresholds.Group.
         * @param min_classification_score the minimum confidence score a classifier must have before being accepted
         * @param min_severity_score the minimum severity score a classifier must have before being accepted
         * @param compare_against_dict_score if confidence score must exceed the dictionary score before being accepted
         */
        constructor(min_classification_score?: number, min_severity_score?: number, compare_against_dict_score?: boolean);
    }
}
//# sourceMappingURL=classification.d.ts.map