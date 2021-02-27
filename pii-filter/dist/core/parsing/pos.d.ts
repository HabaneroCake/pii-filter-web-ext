import { POSInfo, PhraseGroup } from '../interfaces/parsing/tagging';
/**
 * Parts of Speech
 * @private
 */
export declare namespace POS {
    /**
     * @inheritdoc POSInfo
     * @private
     */
    class Tag implements POSInfo {
        tag_base: string;
        tag_rest: Array<string>;
        /** @inheritdoc POSInfo.group */
        group: Tag.Group;
        /**
         * Creates a new POS.Tag.
         * @param tag_base the POS tag base
         * @param tag_rest other POS information
         */
        constructor(tag_base: string, tag_rest: Array<string>);
    }
    /**
     * @private
     */
    namespace Tag {
        /**
         * @inheritdoc PhraseGroup
         * @private
         */
        class Group implements PhraseGroup {
            well_formed: number;
            n_tags: number;
            /**
             * Creates a new POS.Tag.Group.
             * @param well_formed the 'well-formedness' score
             * @param n_tags the number of tags which are part of this group
             */
            constructor(well_formed?: number, n_tags?: number);
        }
    }
    /**
     * Converts a Brill_POS string tag to {@link POSInfo}
     * @private
     * @param tag the Brill_POS string tag
     */
    function from_brill_pos_tag(tag: string): POSInfo;
}
//# sourceMappingURL=pos.d.ts.map