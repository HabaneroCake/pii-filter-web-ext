import { CoreClassifier, CoreAssociationScore, CoreClassificationScore } from '../classification';
import { Trie } from '../../structures/trie';
import { tokens_trie_lookup } from '../trie-lookup';
/**
 * A simple dictionary classifier.
 * @private
 */
export class CoreDictionary extends CoreClassifier {
    /**
     * Create a new CoreDictionary.
     * @param dataset the dataset which contains the words
     * @param general_word_score the classification score for 'plain' words
     * @param popular_word_score the classification score for 'popular' words
     * @param main_words_name the key name of the 'plain' words
     * @param popular_words_name the key name of the 'popular' words
     */
    constructor(dataset, general_word_score, popular_word_score, main_words_name = 'main', popular_words_name = 'pop') {
        super();
        /** The trie which stores the dictionary.  */
        this.main_trie = new Trie();
        // add main word list to trie
        if (main_words_name in dataset && dataset[main_words_name].length > 0)
            this.main_trie.add_list(dataset[main_words_name], general_word_score);
        // add popular word list to trie (overwrites previous score if it exists)
        if (popular_words_name in dataset && dataset[popular_words_name].length > 0)
            this.main_trie.add_list(dataset[popular_words_name], popular_word_score);
    }
    /** @inheritdoc Classifier.classify_associative */
    classify_associative(token) {
        return [new Array(), new CoreAssociationScore(null, 0.0, 0.0, this)];
    }
    /** @inheritdoc Classifier.classify_confidence */
    classify_confidence(token) {
        let [matches, value] = tokens_trie_lookup(token, this.main_trie);
        if (value) {
            return [matches, new CoreClassificationScore(value, 0.0, this)];
        }
        else
            return [new Array(), new CoreClassificationScore(0.0, 0.0, this)];
    }
}
;
//# sourceMappingURL=dictionary-classifier.js.map