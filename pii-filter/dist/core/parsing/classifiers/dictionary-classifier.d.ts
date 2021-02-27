import { AssociationScore, ClassificationScore } from '../../interfaces/parsing/classification';
import { Token } from '../../interfaces/parsing/tokens';
import { CoreClassifier } from '../classification';
import { Trie } from '../../structures/trie';
/**
 * A simple dictionary classifier.
 * @private
 */
export declare abstract class CoreDictionary extends CoreClassifier {
    /** The trie which stores the dictionary.  */
    protected main_trie: Trie<number>;
    /**
     * Create a new CoreDictionary.
     * @param dataset the dataset which contains the words
     * @param general_word_score the classification score for 'plain' words
     * @param popular_word_score the classification score for 'popular' words
     * @param main_words_name the key name of the 'plain' words
     * @param popular_words_name the key name of the 'popular' words
     */
    constructor(dataset: object, general_word_score: number, popular_word_score: number, main_words_name?: string, popular_words_name?: string);
    /** @inheritdoc Classifier.classify_associative */
    classify_associative(token: Token): [Array<Token>, AssociationScore];
    /** @inheritdoc Classifier.classify_confidence */
    classify_confidence(token: Token): [Array<Token>, ClassificationScore];
    /** @inheritdoc Classifier.name */
    abstract name: string;
}
//# sourceMappingURL=dictionary-classifier.d.ts.map