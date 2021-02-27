/**
 * Defines parsing utilities for implementing a language model.
 *
 * @remark This is not part of the public API and should not be depended upon, except when building a language model.
 *
 * @packageDocumentation
 */
/**
 * Simple trie structure (with array storage).
 * @private
 */
export class TrieMulti {
    constructor() {
        /** the nodes/branches */
        this.nodes = new TrieMulti.Branch();
    }
    /**
     * Makes a TrieMulti from a word-list with a certain value.
     * @param words the words to add
     * @param value the value to add for these words
     */
    static make(words, value) {
        let self = new TrieMulti();
        for (let word of words)
            self.insert(word, value);
        return self;
    }
    /**
     * Adds a word-list to this TrieMulti.
     * @param words a word-list
     * @param value the value to add for these words
     */
    add_list(words, value) {
        for (let word of words)
            this.insert(word, value);
    }
    /**
     * Inserts a word into this TrieMulti.
     * @param word the word
     * @param value the value for this word
     */
    insert(word, value) {
        let node = this.nodes;
        for (let i = 0; i < word.length; ++i)
            node = node.get_or_create(word[i]);
        node.make_end();
        node.end.push(value);
    }
    /**
     * Get the matched node for this word.
     * @param word the word
     */
    matched_node(word) {
        let node = this.nodes;
        for (let i = 0; i < word.length; ++i) {
            let char = word[i];
            if (node.has(char))
                node = node.get(char);
            else
                return null;
        }
        return node;
    }
    /**
     * Check if word is matched by TrieMulti.
     * @param word the word
     * @param partial if a partial match is also accepted
     */
    matches(word, partial = false) {
        let node = this.matched_node(word);
        return (node != null) && ((node.end != null) || partial);
    }
    /**
     * Get all partial matches for a word.
     * @param word the word
     */
    partial_matches(word) {
        let results = new Array();
        let node = this.matched_node(word);
        if (node) {
            for (let part of node.parts)
                results.push(`${word}${part}`);
        }
        return results;
    }
}
;
/**
 * @private
 */
(function (TrieMulti) {
    /**
     * A branch/node for {@link TrieMulti}
     * @private
     */
    class Branch {
        constructor() {
            /** the contained nodes */
            this.nodes = new Map();
        }
        /**
         * Gets or creates a new branch/node and returns the result.
         * @param key the letter/word to get or create
         */
        get_or_create(key) {
            if (this.has(key)) {
                return this.get(key);
            }
            else {
                let new_branch = new Branch();
                this.nodes.set(key, new_branch);
                return new_branch;
            }
        }
        /**
         * Makes the current node an end.
         */
        make_end() {
            if (this._end == null)
                this._end = new Array();
        }
        /** An ending node. */
        get end() { return this._end; }
        /** An ending node. */
        set end(end) { this._end = end; }
        /**
         * Whether this branch has a key.
         * @param key the key to check for
         */
        has(key) { return this.nodes.has(key); }
        /**
         * Gets a certain branch.
         * @param key the key to get a branch for.
         */
        get(key) { return this.nodes.get(key); }
        /**
         * Gets the number of nodes this branch contains.
         */
        get size() { return this.nodes.size; }
        /**
         * --
         */
        get parts() {
            let results = new Array();
            for (let [key, value] of this.nodes)
                if (value.size > 0)
                    for (let part of value.parts)
                        results.push(`${key}${part}`);
                else
                    results.push(`${key}`);
            return results;
        }
    }
    TrieMulti.Branch = Branch;
    ;
})(TrieMulti || (TrieMulti = {}));
;
//# sourceMappingURL=trie-multi.js.map