import { Language } from '../../interfaces/language';
import { Token } from '../../interfaces/parsing/tokens';
import { POSInfo } from '../../interfaces/parsing/tagging';
import { AssociativeScore, AssociationScore } from '../../interfaces/parsing/classification';
import { CoreClassifier } from '../classification';
import { Trie } from '../../structures/trie';
/**
 * A basic abstract associative classifier, which classifies associative tokens based on a dataset.
 * The confidence classifier is unimplemented.
 * @private
 */
export declare abstract class CoreAssociativeClassifier extends CoreClassifier {
    protected dataset: object;
    protected associative_words_name: string;
    protected pos_associative_words_name: string;
    protected pii_associative_words_name: string;
    /**
     * A map storing the parts of speech mappings for this classifier.
     */
    protected assoc_pos_map: Map<string, Array<[POSInfo, AssociativeScore]>>;
    /**
     * A trie storing associative words for this classifier.
     */
    protected association_trie: Trie<AssociativeScore>;
    /**
     * Create a new CoreAssociativeClassifier
     * @param dataset the dataset which the keys will be looked up in
     * @param associative_words_name the key name of the associative mappings in the dataset
     * @param pos_associative_words_name the key name of the parts of speech mappings in the dataset
     * @param pii_associative_words_name the key name of the associative pii mappings in the dataset
     */
    constructor(dataset: object, associative_words_name?: string, pos_associative_words_name?: string, pii_associative_words_name?: string);
    /** @inheritdoc Classifier.init */
    init(language_model: Language): void;
    /** @inheritdoc Classifier.classify_associative */
    classify_associative(token: Token): [Array<Token>, AssociationScore];
}
//# sourceMappingURL=associative-classifier.d.ts.map