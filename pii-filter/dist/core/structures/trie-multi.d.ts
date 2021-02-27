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
export declare class TrieMulti<T> {
    /** the nodes/branches */
    private nodes;
    /**
     * Makes a TrieMulti from a word-list with a certain value.
     * @param words the words to add
     * @param value the value to add for these words
     */
    static make<T>(words: Array<string>, value: T): TrieMulti<T>;
    /**
     * Adds a word-list to this TrieMulti.
     * @param words a word-list
     * @param value the value to add for these words
     */
    add_list(words: Array<string>, value: T): void;
    /**
     * Inserts a word into this TrieMulti.
     * @param word the word
     * @param value the value for this word
     */
    insert(word: string, value: T): void;
    /**
     * Get the matched node for this word.
     * @param word the word
     */
    matched_node(word: string): TrieMulti.Branch<T>;
    /**
     * Check if word is matched by TrieMulti.
     * @param word the word
     * @param partial if a partial match is also accepted
     */
    matches(word: string, partial?: boolean): boolean;
    /**
     * Get all partial matches for a word.
     * @param word the word
     */
    partial_matches(word: string): Array<string>;
}
/**
 * @private
 */
export declare namespace TrieMulti {
    /**
     * A branch/node for {@link TrieMulti}
     * @private
     */
    class Branch<T> {
        /** the contained nodes */
        private nodes;
        /** if this is an end-node this array is non-null and populated */
        private _end;
        /**
         * Gets or creates a new branch/node and returns the result.
         * @param key the letter/word to get or create
         */
        get_or_create(key: string): Branch<T>;
        /**
         * Makes the current node an end.
         */
        make_end(): void;
        /** An ending node. */
        get end(): Array<T>;
        /** An ending node. */
        set end(end: Array<T>);
        /**
         * Whether this branch has a key.
         * @param key the key to check for
         */
        has(key: string): boolean;
        /**
         * Gets a certain branch.
         * @param key the key to get a branch for.
         */
        get(key: string): Branch<T>;
        /**
         * Gets the number of nodes this branch contains.
         */
        get size(): number;
        /**
         * --
         */
        get parts(): Array<string>;
    }
}
//# sourceMappingURL=trie-multi.d.ts.map