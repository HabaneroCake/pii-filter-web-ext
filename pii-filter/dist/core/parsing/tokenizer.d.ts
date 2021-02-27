import { Token, Tokenizer } from '../interfaces/parsing/tokens';
import { Language } from '../interfaces/language';
/**
 * @inheritdoc Tokenizer
 * @private
 */
export declare class CoreTokenizer implements Tokenizer {
    /** @inheritdoc */
    tokens: Array<Token>;
    /**
     * Creates a linked list of tokens from input text.
     * @param text input text
     * @param language_model the input language model
     */
    constructor(text: string, language_model: Language);
}
//# sourceMappingURL=tokenizer.d.ts.map