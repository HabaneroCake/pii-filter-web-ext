/**
 * Parts of Speech
 * @private
 */
export var POS;
(function (POS) {
    /**
     * @inheritdoc POSInfo
     * @private
     */
    class Tag {
        /**
         * Creates a new POS.Tag.
         * @param tag_base the POS tag base
         * @param tag_rest other POS information
         */
        constructor(tag_base, tag_rest) {
            this.tag_base = tag_base;
            this.tag_rest = tag_rest;
            /** @inheritdoc POSInfo.group */
            this.group = null;
        }
        ;
    }
    POS.Tag = Tag;
    /**
     * @private
     */
    (function (Tag) {
        /**
         * @inheritdoc PhraseGroup
         * @private
         */
        class Group {
            /**
             * Creates a new POS.Tag.Group.
             * @param well_formed the 'well-formedness' score
             * @param n_tags the number of tags which are part of this group
             */
            constructor(well_formed = 0, n_tags = 0) {
                this.well_formed = well_formed;
                this.n_tags = n_tags;
            }
        }
        Tag.Group = Group;
        ;
    })(Tag = POS.Tag || (POS.Tag = {}));
    ;
    /**
     * Converts a Brill_POS string tag to {@link POSInfo}
     * @private
     * @param tag the Brill_POS string tag
     */
    function from_brill_pos_tag(tag) {
        let tag_base = tag;
        let tag_rest = new Array();
        let left_paren_index = tag.indexOf('(');
        let right_paren_index = tag.indexOf(')', left_paren_index);
        if (left_paren_index > -1 && right_paren_index > -1) {
            tag_base = tag.substr(0, left_paren_index);
            tag_rest = tag.substr(left_paren_index + 1, right_paren_index - left_paren_index - 1).split(',');
        }
        return new POS.Tag(tag_base, tag_rest);
    }
    POS.from_brill_pos_tag = from_brill_pos_tag;
})(POS || (POS = {}));
;
//# sourceMappingURL=pos.js.map