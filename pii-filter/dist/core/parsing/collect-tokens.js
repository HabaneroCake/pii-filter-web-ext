/**
 * Iterates over tokens and collects tokens based on {@link collect_tokens.Control} returns.
 * @private
 * @param start_token the token to start with
 * @param validate_token the function which is called for each token to validate the token and decide control-flow
 */
export function collect_tokens(start_token, validate_token) {
    let is_match = false;
    let end_token = start_token;
    let final_deferred = new Array();
    let final_matches = new Array();
    // temporary values
    let deferred_matches = new Array();
    let t_it = start_token;
    while (t_it != null) {
        let result = validate_token(t_it, deferred_matches);
        if (result == collect_tokens.Control.MATCH ||
            result == collect_tokens.Control.MATCH_AND_CONTINUE ||
            result == collect_tokens.Control.VALID) {
            for (let t of deferred_matches)
                final_deferred.push(t);
            final_deferred.push(t_it);
            if (result == collect_tokens.Control.MATCH ||
                result == collect_tokens.Control.MATCH_AND_CONTINUE) {
                end_token = t_it;
                is_match = true;
                for (let t of final_deferred)
                    final_matches.push(t);
                if (result == collect_tokens.Control.MATCH_AND_CONTINUE)
                    final_deferred = new Array();
                else if (result == collect_tokens.Control.MATCH)
                    break;
            }
            deferred_matches = new Array();
        }
        else if (result == collect_tokens.Control.DEFER_VALID) {
            deferred_matches.push(t_it);
        }
        else if (collect_tokens.Control.INVALID) {
            break;
        }
        t_it = t_it.next;
    }
    return [
        is_match,
        [
            start_token,
            end_token,
            final_matches
        ]
    ];
}
/**
 * @private
 */
(function (collect_tokens) {
    /**
     * The control-flow states.
     * @private
     */
    let Control;
    (function (Control) {
        Control[Control["MATCH"] = 0] = "MATCH";
        Control[Control["MATCH_AND_CONTINUE"] = 1] = "MATCH_AND_CONTINUE";
        Control[Control["VALID"] = 2] = "VALID";
        Control[Control["DEFER_VALID"] = 3] = "DEFER_VALID";
        Control[Control["INVALID"] = 4] = "INVALID";
    })(Control = collect_tokens.Control || (collect_tokens.Control = {}));
    ;
})(collect_tokens || (collect_tokens = {}));
;
//# sourceMappingURL=collect-tokens.js.map