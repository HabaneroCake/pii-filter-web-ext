import { Token } from '../interfaces/parsing/tokens';
/**
 * Counts the number of tokens in a range which are not punctuation.
 * @private
 * @param start_token the start of the token range
 * @param end_token the end of the token range
 * @param punctuation_map the punctuation to check for
 */
export declare function count_str_tokens(start_token: Token, end_token: Token, punctuation_map: Map<string, number>): number;
//# sourceMappingURL=count-str-tokens.d.ts.map