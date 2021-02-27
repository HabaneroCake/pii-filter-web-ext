/**
 * Defines parsing utilities for implementing a language model.
 *
 * @remark This is not part of the public API and should not be depended upon, except when building a language model.
 *
 * @packageDocumentation
 */
/**
 * Simple trie structure.
 * @private
 */
export declare class Trie<T> {
    /** the nodes/branches */
    private nodes;
    /**
     * Makes a Trie from a word-list with a certain value.
     * @param words the words to add
     * @param value the value to set for these words
     */
    static make<T>(words: Array<string>, value: T): Trie<T>;
    /**
     * Adds a word-list to this Trie.
     * @param words a word-list
     * @param value the value to set for these words
     */
    add_list(words: Array<string>, value: T): void;
    /**
     * Inserts a word into this Trie.
     * @param word the word
     * @param value the value for this word
     */
    insert(word: string, value: T): void;
    /**
     * Get the matched node for this word.
     * @param word the word
     */
    matched_node(word: string): Trie.Branch<T>;
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
export declare namespace Trie {
    /**
     * A branch/node for {@link Trie}
     * @private
     */
    class Branch<T> {
        /** the contained nodes */
        private nodes;
        /** if this is an end-node this value is non-null */
        private _end;
        /**
         * Gets or creates a new branch/node and returns the result.
         * @param key the letter/word to get or create
         */
        get_or_create(key: string): Branch<T>;
        /** An ending node. */
        get end(): T;
        /** An ending node. */
        set end(end: T);
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
//# sourceMappingURL=trie.d.ts.map