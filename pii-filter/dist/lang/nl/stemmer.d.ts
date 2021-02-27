import { Stemmer } from '../../core/interfaces/parsing/tokens';
import { POSInfo } from '../../core/interfaces/parsing/tagging';
/**
 * @inheritdoc Stemmer
 * @private
 */
export declare class DutchStemmer implements Stemmer {
    /** @inheritdoc */
    stem(token: string, tag: POSInfo): string;
}
//# sourceMappingURL=stemmer.d.ts.map