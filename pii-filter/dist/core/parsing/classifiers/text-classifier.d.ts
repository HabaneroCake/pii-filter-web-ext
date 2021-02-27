import { CoreAssociativeClassifier } from './associative-classifier';
import { ClassificationScore } from '../../interfaces/parsing/classification';
import { Token } from '../../interfaces/parsing/tokens';
import { Trie } from '../../structures/trie';
/**
 * A basic text classifier, which classifies tokens (and associative tokens) based on a dataset.
 * @private
 */
export declare abstract class CoreTextClassifier extends CoreAssociativeClassifier {
    protected dataset: object;
    protected classification_score_base: number;
    protected severity_score_base: number;
    protected use_stem: boolean;
    protected main_name: string;
    /**
     * The trie which stores the dataset.
     */
    protected main_trie: Trie<boolean>;
    /**
     * Creates a new CoreTextClassifier.
     * @param dataset the dataset
     * @param classification_score_base the base classification score for a match
     * @param severity_score_base the base severity score for a match
     * @param use_stem whether to use the stem
     * @param main_name the key name of the word list in the dataset
     */
    constructor(dataset: object, classification_score_base: number, severity_score_base: number, use_stem: boolean, main_name?: string);
    /** @inheritdoc Classifier.classify_confidence */
    classify_confidence(token: Token): [Array<Token>, ClassificationScore];
    /** @inheritdoc Classifier.name */
    abstract name: string;
}
//# sourceMappingURL=text-classifier.d.ts.map