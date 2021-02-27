import { Token } from "../interfaces/parsing/tokens";
/**
 * Iterates over tokens and collects tokens based on {@link collect_tokens.Control} returns.
 * @private
 * @param start_token the token to start with
 * @param validate_token the function which is called for each token to validate the token and decide control-flow
 */
export declare function collect_tokens(start_token: Token, validate_token: (token: Token, deferred_matches: Array<Token>) => collect_tokens.Control): [boolean, [Token, Token, Array<Token>]];
/**
 * @private
 */
export declare namespace collect_tokens {
    /**
     * The control-flow states.
     * @private
     */
    enum Control {
        MATCH = 0,
        MATCH_AND_CONTINUE = 1,
        VALID = 2,
        DEFER_VALID = 3,
        INVALID = 4
    }
}
//# sourceMappingURL=collect-tokens.d.ts.map