/**
 * @inheritdoc Stemmer
 * @private
 */
export class DutchStemmer {
    /** @inheritdoc */
    stem(token, tag) {
        token = token.replace('\'s', '').toLowerCase();
        if (tag.tag_rest.indexOf('verl_dw') > -1) {
            let ge_regex = /\b(ge)/;
            let d_regex = /(d)\b/;
            if (ge_regex.test(token)) {
                token = token.replace(ge_regex, '');
                if (d_regex.test(token)) {
                    token = token.replace(d_regex, '');
                }
            }
        }
        // return PorterStemmerNl.stem(token);
        return token;
    }
}
;
//# sourceMappingURL=stemmer.js.map