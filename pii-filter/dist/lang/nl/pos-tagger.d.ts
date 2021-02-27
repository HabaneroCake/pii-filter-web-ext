import { Language, POSTagger } from '../../core/interfaces';
import * as Parsing from '../../core/parsing';
/**
 * @inheritdoc POSTagger
 * @private
 */
export declare class DutchPOSTagger implements POSTagger {
    none_str: string;
    private tagger;
    /** @inheritdoc */
    tag(tokens: Array<string>, language_model: Language): Array<[string, Parsing.POS.Tag]>;
}
//# sourceMappingURL=pos-tagger.d.ts.map