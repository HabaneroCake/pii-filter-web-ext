import { ClassificationScore } from '../../interfaces/parsing/classification';
import { Token } from '../../interfaces/parsing/tokens';
import { CoreTextClassifier } from './text-classifier';
import { CoreAssociativeClassifier } from './associative-classifier';
import { Trie } from '../../structures/trie';
/**
 * A name classifier. Useful for matching names, product names, etc.
 * @private
 */
export declare abstract class CoreNameClassifier extends CoreTextClassifier {
    protected uppercase_classification_score_base: number;
    protected pos_classification_score_base: number;
    protected pos_possible_classification_score_base: number;
    /**
     * Creates a new CoreNameClassifier.
     * @param dataset the dataset
     * @param classification_score_base the base score for a match
     * @param uppercase_classification_score_base the score for a token starting with a capital letter
     * @param pos_classification_score_base the score for a token which is classified as a name by POS tagging
     * @param pos_possible_classification_score_base the score for a token which is not yet classified by POS tagging
     * @param severity_score_base the base severity score
     * @param main_name the key name of the main word list in the dataset
     */
    constructor(dataset: object, classification_score_base: number, uppercase_classification_score_base: number, pos_classification_score_base: number, pos_possible_classification_score_base: number, severity_score_base: number, main_name?: string);
    /** @inheritdoc Classifier.classify_confidence */
    classify_confidence(token: Token): [
        Array<Token>,
        ClassificationScore
    ];
    /** @inheritdoc Classifier.name */
    abstract name: string;
}
/**
 * A multi-name classifier. Useful for matching names, product names, etc. while distinguishing between several
 * different scores and severities for the different word-lists.
 * @private
 */
export declare abstract class CoreMultiNameClassifier extends CoreAssociativeClassifier {
    protected sum_results: boolean;
    /**
     * The different word-lists and their scores.
     */
    protected tries_and_settings: Array<CoreMultiNameClassifier.TrieWithSettings>;
    /**
     * Creates a new CoreMultiNameClassifier.
     * @param dataset the dataset which contains the word-lists
     * @param name_settings an array containing the settings fro each word-list
     * @param sum_results wether to sum the results or keep the highest scoring value only
     */
    constructor(dataset: object, name_settings: Array<CoreMultiNameClassifier.Settings>, sum_results?: boolean);
    /** @inheritdoc Classifier.classify_confidence */
    classify_confidence(token: Token): [
        Array<Token>,
        ClassificationScore
    ];
    /** @inheritdoc Classifier.name */
    abstract name: string;
}
/**
 * @private
 */
export declare namespace CoreMultiNameClassifier {
    /**
     * The settings used by {@link CoreMultiNameClassifier.TrieWithSettings}.
     * @private
     */
    class Settings {
        classification_score_base: number;
        uppercase_classification_score_base: number;
        pos_classification_score_base: number;
        pos_possible_classification_score_base: number;
        severity_score_base: number;
        dataset_name: string;
        /**
         * Creates a new CoreMultiNameClassifier.Settings.
         * @param classification_score_base the base classification score
         * @param uppercase_classification_score_base the score for a token starting with a capital letter
         * @param pos_classification_score_base the score for a token which is classified as a name by POS
         * @param pos_possible_classification_score_base the score for a token which is not yet classified by POS
         * @param severity_score_base the severity base score
         * @param dataset_name the key name for this dataset
         */
        constructor(classification_score_base: number, uppercase_classification_score_base: number, pos_classification_score_base: number, pos_possible_classification_score_base: number, severity_score_base: number, dataset_name: string);
    }
    /**
     * The structure used by {@link CoreMultiNameClassifier}.
     * @private
     */
    class TrieWithSettings {
        settings: Settings;
        /**
         * The trie which contains the word-list
         */
        protected trie: Trie<number>;
        /**
         * Creates a new CoreMultiNameClassifier.TrieWithSettings.
         * @param dataset the dataset
         * @param settings the settings
         */
        constructor(dataset: object, settings: Settings);
        /**
         * Classifies the confidence for this token.
         * @param token the token to classify
         * @param use_stem wether to use the stem or the full symbol
         */
        classify_confidence(token: Token, use_stem: boolean): [Array<Token>, number];
    }
}
//# sourceMappingURL=name-classifier.d.ts.map