import { CoreClassifier, CoreAssociativeScore, CoreAssociationScore } from '../classification';
import { tokens_trie_lookup } from '../trie-lookup';
import { Trie } from '../../structures/trie';
import { POS } from '../pos';
/**
 * A basic abstract associative classifier, which classifies associative tokens based on a dataset.
 * The confidence classifier is unimplemented.
 * @private
 */
export class CoreAssociativeClassifier extends CoreClassifier {
    /**
     * Create a new CoreAssociativeClassifier
     * @param dataset the dataset which the keys will be looked up in
     * @param associative_words_name the key name of the associative mappings in the dataset
     * @param pos_associative_words_name the key name of the parts of speech mappings in the dataset
     * @param pii_associative_words_name the key name of the associative pii mappings in the dataset
     */
    constructor(dataset, associative_words_name = 'association_multipliers', pos_associative_words_name = 'pos_association_multipliers', pii_associative_words_name = 'pii_association_multipliers') {
        super();
        this.dataset = dataset;
        this.associative_words_name = associative_words_name;
        this.pos_associative_words_name = pos_associative_words_name;
        this.pii_associative_words_name = pii_associative_words_name;
        /**
         * A map storing the parts of speech mappings for this classifier.
         */
        this.assoc_pos_map = new Map();
        /**
         * A trie storing associative words for this classifier.
         */
        this.association_trie = new Trie();
        // add association multipliers to trie
        if (this.associative_words_name in this.dataset && this.dataset[this.associative_words_name].length > 0) {
            for (const [word, [left_max, right_max, score, severity]] of this.dataset[this.associative_words_name])
                this.association_trie.insert(word, new CoreAssociativeScore(left_max, right_max, score, severity));
        }
    }
    /** @inheritdoc Classifier.init */
    init(language_model) {
        super.init(language_model);
        if (this.pos_associative_words_name in this.dataset && this.dataset[this.pos_associative_words_name].length > 0) {
            for (const [pos, [left_max, right_max, score, severity]] of this.dataset[this.pos_associative_words_name]) {
                let tag = POS.from_brill_pos_tag(pos);
                let assoc_score = new CoreAssociativeScore(left_max, right_max, score, severity);
                if (!this.assoc_pos_map.has(tag.tag_base))
                    this.assoc_pos_map.set(tag.tag_base, new Array());
                this.assoc_pos_map.get(tag.tag_base).push([tag, assoc_score]);
            }
        }
        if (this.pii_associative_words_name in this.dataset && this.dataset[this.pii_associative_words_name].length > 0) {
            for (const [name, array_of_pii_scores] of this.dataset[this.pii_associative_words_name]) {
                for (let classifier of language_model.classifiers) {
                    if (classifier.name == name) {
                        for (let [left_max, right_max, score, severity] of array_of_pii_scores) {
                            classifier.associative_references.push([
                                this,
                                new CoreAssociativeScore(left_max, right_max, score, severity)
                            ]);
                        }
                        break;
                    }
                }
            }
        }
    }
    /** @inheritdoc Classifier.classify_associative */
    classify_associative(token) {
        let best_pos_score = null;
        let lower_tag_base = token.tag.tag_base.toLowerCase();
        if (this.assoc_pos_map.has(lower_tag_base)) {
            let tags = this.assoc_pos_map.get(lower_tag_base);
            for (let [tag, score] of tags) {
                let match = true;
                for (let t_rest of tag.tag_rest) {
                    if (t_rest.length == 0)
                        continue;
                    let found = false;
                    for (let tt_rest of token.tag.tag_rest) {
                        if (tt_rest.toLowerCase() == t_rest)
                            found = true;
                        break;
                    }
                    if (!found) {
                        match = false;
                        break;
                    }
                }
                if (match && (best_pos_score == null || score.score > best_pos_score.score))
                    best_pos_score = score;
            }
            // let tag = null;
            // [tag, best_pos_score] = tags[0];
        }
        let [matches, value] = tokens_trie_lookup(token, this.association_trie);
        if (value != null) {
            if (best_pos_score != null && best_pos_score.score > value.score)
                return [matches, new CoreAssociationScore(best_pos_score, best_pos_score.score, best_pos_score.severity, this)];
            else
                return [matches, new CoreAssociationScore(value, value.score, value.severity, this)];
        }
        else if (best_pos_score != null) {
            return [[token], new CoreAssociationScore(best_pos_score, best_pos_score.score, best_pos_score.severity, this)];
        }
        else
            return [new Array(), new CoreAssociationScore(null, 0.0, 0.0, this)];
    }
}
//# sourceMappingURL=associative-classifier.js.map