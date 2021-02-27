/**
 * Attempts to (full-)match as many tokens to a trie as possible
 * @private
 * @param token a token (linked to its neighbors), with a string symbol
 * @param trie a trie to look the token symbol up in
 */
export function tokens_trie_lookup(token, trie, use_stem = false) {
    const wildcard = '*';
    let token_iter = token;
    let matched_node = null;
    let matches = new Array();
    let last_symbol = null;
    let symbol = (use_stem ? token_iter.stem : token_iter.symbol).toLowerCase();
    let end_token = null;
    let end_value = null;
    let final_matches = new Array();
    if (token.symbol == wildcard)
        return [final_matches, end_value];
    // TODO: partial matches, currently only does full matches
    do {
        matched_node = trie.matched_node(symbol);
        // check for wildcard
        if (matched_node == null && last_symbol != null) {
            symbol = last_symbol + wildcard;
            matched_node = trie.matched_node(symbol);
        }
        // check for match
        if (matched_node != null) {
            matches.push(token_iter);
            // store last full match
            if (matched_node.end) {
                end_token = token_iter;
                end_value = matched_node.end;
            }
            // check for extended match
            if (token_iter.next != null) {
                last_symbol = symbol;
                token_iter = token_iter.next;
                symbol += (use_stem ? token_iter.stem : token_iter.symbol).toLowerCase();
            }
            else
                break;
        }
    } while (matched_node != null);
    // full match was found
    if (end_token) {
        for (let match of matches) {
            final_matches.push(match);
            if (end_token == match)
                break;
        }
    }
    return [final_matches, end_value];
}
//# sourceMappingURL=trie-lookup.js.map