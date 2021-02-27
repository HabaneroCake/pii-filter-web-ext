import { Token } from '../interfaces/parsing/tokens';
import { Trie } from '../structures/trie';
/**
 * Attempts to (full-)match as many tokens to a trie as possible
 * @private
 * @param token a token (linked to its neighbors), with a string symbol
 * @param trie a trie to look the token symbol up in
 */
export declare function tokens_trie_lookup<T>(token: Token, trie: Trie<T>, use_stem?: boolean): [Array<Token>, T];
//# sourceMappingURL=trie-lookup.d.ts.map