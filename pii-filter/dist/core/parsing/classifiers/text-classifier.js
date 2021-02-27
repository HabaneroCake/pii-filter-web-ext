import { CoreAssociativeClassifier } from './associative-classifier';
import { Trie } from '../../structures/trie';
import { CoreClassificationScore } from '../classification';
import { tokens_trie_lookup } from '../trie-lookup';
import { calc_assoc_severity_sum } from '../calc-assoc-severity';
/**
 * A basic text classifier, which classifies tokens (and associative tokens) based on a dataset.
 * @private
 */
export class CoreTextClassifier extends CoreAssociativeClassifier {
    /**
     * Creates a new CoreTextClassifier.
     * @param dataset the dataset
     * @param classification_score_base the base classification score for a match
     * @param severity_score_base the base severity score for a match
     * @param use_stem whether to use the stem
     * @param main_name the key name of the word list in the dataset
     */
    constructor(dataset, classification_score_base, severity_score_base, use_stem, main_name = 'main') {
        super(dataset);
        this.dataset = dataset;
        this.classification_score_base = classification_score_base;
        this.severity_score_base = severity_score_base;
        this.use_stem = use_stem;
        this.main_name = main_name;
        /**
         * The trie which stores the dataset.
         */
        this.main_trie = new Trie();
        // add main word list to trie
        if (main_name in this.dataset && this.dataset[main_name].length > 0)
            this.main_trie.add_list(this.dataset[main_name], true);
    }
    /** @inheritdoc Classifier.classify_confidence */
    classify_confidence(token) {
        let [matches, value] = tokens_trie_lookup(token, this.main_trie, this.use_stem);
        if (value) {
            // check for associative multipliers
            let left_it = matches[0];
            let right_it = matches[matches.length - 1];
            let [assoc_sum, severity_sum] = calc_assoc_severity_sum(left_it, right_it, this, this.language_model, this.language_model.max_assoc_distance);
            return [matches, new CoreClassificationScore(Math.min(this.classification_score_base + assoc_sum, 1.0), Math.min(this.severity_score_base + severity_sum, 1.0), this)];
        }
        else
            return [new Array(), new CoreClassificationScore(0.0, 0.0, this)];
    }
}
;
//# sourceMappingURL=text-classifier.js.map