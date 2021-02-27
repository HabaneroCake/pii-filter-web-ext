/**
 * @inheritdoc Classifier
 * @private
 */
export class CoreClassifier {
    constructor() {
        /** @inheritdoc */
        this.associative_references = new Array();
    }
    /** @inheritdoc */
    init(language_model) {
        this.language_model = language_model;
    }
}
;
/**
 * @inheritdoc Classification
 * @private
 */
export class CoreClassification {
    /**
     * Creates a new CoreClassification.
     * @param classifier the classifier which was used
     */
    constructor(classifier) {
        this.classifier = classifier;
        this.group_root_start = null;
        this.group_root_end = null;
    }
    /** @inheritdoc Classification.valid */
    valid() { return this.classifier != null; }
}
;
/**
 * @inheritdoc ClassificationScore
 * @private
 */
export class CoreClassificationScore extends CoreClassification {
    /**
     * Creates a new CoreClassificationScore.
     * @param score the confidence score
     * @param severity the severity score
     * @param classifier the classifier which was used
     */
    constructor(score, severity, classifier) {
        super(classifier);
        this.score = score;
        this.severity = severity;
    }
}
;
/**
 * @inheritdoc AssociativeScore
 * @private
 */
export class CoreAssociativeScore {
    /**
     * Creates a new CoreAssociativeScore.
     * @param left_max the maximum distance from the left that a classification may use this association
     * @param right_max the maximum distance from the right that a classification may use this association
     * @param score the amount of confidence it adds
     * @param severity the amount of severity it adds
     */
    constructor(left_max, right_max, score, severity) {
        this.left_max = left_max;
        this.right_max = right_max;
        this.score = score;
        this.severity = severity;
    }
}
;
/**
 * @inheritdoc AssociationScore
 * @private
 */
export class CoreAssociationScore extends CoreClassificationScore {
    /**
     * Creates a new CoreAssociationScore.
     * @param associative_score the associative score
     * @param score the amount of confidence it adds
     * @param severity the amount of severity it adds
     * @param classifier the classifier which provided this match
     */
    constructor(associative_score, // global
    score, // can be adjusted
    severity, // can be adjusted
    classifier) {
        super(score, severity, classifier);
        this.associative_score = associative_score;
    }
    /** @inheritdoc */
    valid_from_left(distance_from_left, n_phrase_endings) {
        return this.valid() && (this.associative_score.left_max == -1 && n_phrase_endings == 0) ||
            (this.associative_score.left_max > 0 && distance_from_left <= this.associative_score.left_max);
    }
    /** @inheritdoc */
    valid_from_right(distance_from_right, n_phrase_endings) {
        return this.valid() && (this.associative_score.right_max == -1 && n_phrase_endings == 0) ||
            (this.associative_score.right_max > 0 && distance_from_right <= this.associative_score.right_max);
    }
}
;
/**
 * @inheritdoc Associations
 * @private
 */
export class CoreAssociations {
    constructor() {
        /** the raw associations */
        this.assoc_map = new Map();
    }
    /** @inheritdoc */
    add(classifier, association_score) {
        if (!this.assoc_map.has(classifier))
            this.assoc_map.set(classifier, new Array());
        let arr = this.assoc_map.get(classifier);
        if (arr.indexOf(association_score) > -1)
            throw new Error('association score has already been added');
        // only if bounds conform to existing bounds
        if (arr.length == 0 ||
            association_score.group_root_start.index == arr[0].group_root_start.index &&
                association_score.group_root_end.index == arr[0].group_root_end.index) {
            arr.push(association_score);
            // sort in descending order
            this.assoc_map.set(classifier, arr.sort((i1, i2) => i2.score - i1.score));
        }
    }
    /** @inheritdoc */
    has(classifier) { return this.assoc_map.has(classifier); }
    /** @inheritdoc */
    get(classifier) {
        return this.assoc_map.get(classifier);
    }
    /** @inheritdoc */
    max(classifier) {
        if (this.has(classifier))
            return this.assoc_map.get(classifier)[0];
        return new CoreAssociationScore(null, 0, 0, null);
    }
    /** @inheritdoc */
    values() {
        return this.assoc_map.values();
    }
}
;
/**
 * @inheritdoc Confidences
 * @private
 */
export class CoreConfidences {
    constructor() {
        /** the raw confidences */
        this.confidences = new Array();
    }
    /** @inheritdoc */
    add(classification_score) {
        let confidence_with_same_classifier = null;
        for (let conf of this.confidences) {
            if (conf.classifier == classification_score.classifier) {
                confidence_with_same_classifier = conf;
                break;
            }
        }
        if (confidence_with_same_classifier != null) {
            confidence_with_same_classifier.score = classification_score.score;
            confidence_with_same_classifier.group_root_start = classification_score.group_root_start;
            confidence_with_same_classifier.group_root_end = classification_score.group_root_end;
        }
        else
            this.confidences.push(classification_score);
        // sort descending
        this.confidences = this.confidences.sort((i1, i2) => {
            // let len_diff: number = (i2.group_root_end.index-i2.group_root_start.index) - 
            //                         (i1.group_root_end.index-i1.group_root_start.index);
            // return (len_diff == 0) ? (i2.score - i1.score) : len_diff;
            return (i2.score - i1.score);
        });
    }
    /** @inheritdoc */
    max() {
        if (this.confidences.length)
            return this.confidences[0];
        return new CoreClassificationScore(0, 0, null);
    }
    /** @inheritdoc */
    all() {
        return this.confidences;
    }
}
;
/**
 * @inheritdoc Thresholds
 * @private
 */
export class CoreThresholds {
    /**
     * Creates a new CoreThresholds.
     * @param well_formedness_threshold the threshold for text to be 'well-formed'
     * @param well_formed the settings for 'well-formed' text
     * @param ill_formed the settings for 'ill-formed' text
     */
    constructor(well_formedness_threshold, well_formed, ill_formed) {
        this.well_formedness_threshold = well_formedness_threshold;
        this.well_formed = well_formed;
        this.ill_formed = ill_formed;
    }
    ;
    /** @inheritdoc */
    validate(classification, well_formed) {
        if (classification.valid()) {
            let classification_exceeds_dict_match = (classification.group_root_start != null &&
                classification.group_root_end != null) &&
                (classification.group_root_start.confidence_dictionary == null ||
                    (classification.score > classification.group_root_start.confidence_dictionary.score ||
                        classification.group_root_end.index >
                            classification.group_root_start.confidence_dictionary.group_root_end.index));
            let tag_groups_match = (classification.group_root_start.tag.group ==
                classification.group_root_end.tag.group);
            let tag_group_well_formed = (classification.group_root_start.tag.group.well_formed >
                this.well_formedness_threshold);
            // not enough information to go by
            let too_few_tags = classification.group_root_start.tag.group.n_tags < 3;
            let active_config = (well_formed == null ?
                ((tag_groups_match && (tag_group_well_formed || too_few_tags)) ?
                    this.well_formed : this.ill_formed) :
                (well_formed ?
                    this.well_formed : this.ill_formed));
            return ((active_config.compare_against_dict_score && classification_exceeds_dict_match) ||
                !active_config.compare_against_dict_score) &&
                classification.score > active_config.min_classification_score &&
                classification.severity > active_config.min_severity_score;
        }
        return false;
    }
}
;
/**
 * @private
 */
(function (CoreThresholds) {
    /**
     * @inheritdoc ThresholdSetting
     * @private
     */
    class Group {
        /**
         * Creates a new CoreThresholds.Group.
         * @param min_classification_score the minimum confidence score a classifier must have before being accepted
         * @param min_severity_score the minimum severity score a classifier must have before being accepted
         * @param compare_against_dict_score if confidence score must exceed the dictionary score before being accepted
         */
        constructor(min_classification_score = 0, min_severity_score = 0, compare_against_dict_score = false) {
            this.min_classification_score = min_classification_score;
            this.min_severity_score = min_severity_score;
            this.compare_against_dict_score = compare_against_dict_score;
        }
        ;
    }
    CoreThresholds.Group = Group;
})(CoreThresholds || (CoreThresholds = {}));
;
//# sourceMappingURL=classification.js.map