import * as Parsing from '../../../core/parsing';
import ds_phone_number from '../dataset/ds_phone_number.json';
/**
 * Checks wether a string is a valid phone number.
 * @private
 * @param phone_number the phone number
 */
function validate_phone_number(phone_number) {
    return /^((00)?31)?((?!((00)?31))((0[1-9][0-9]{7,8})|([1-9][0-9]{7,8})))$/.test(phone_number.replace(/\D/g, ''));
}
/**
 * Checks whether a phone number is a mobile number.
 * @private
 * @param phone_number the phone number string
 */
function is_06(phone_number) {
    return /^((00)?31)?0?6/.test(phone_number.replace(/\D/g, ''));
}
/**
 * A simple phone number classifier.
 * @private
 */
export class PhoneNumber extends Parsing.CoreAssociativeClassifier {
    /**
     * Creates a new Dutch phone number classifier.
     */
    constructor() {
        super(ds_phone_number);
        /** @inheritdoc */
        this.name = 'phone_number';
    }
    /** @inheritdoc */
    classify_confidence(token) {
        if (/^(\+|\(|0|6)/.test(token.symbol)) {
            const min_number_length = 7;
            const max_number_length = 15;
            let has_numbers = /\d+/;
            let has_letters = /[a-zA-Z]+/;
            let has_symbols = /\-|\+|\(|\)/;
            let deferred_text = '';
            let number_value = '';
            let total_num_length = 0;
            let last_seen_number = null;
            let [matched, [start_token, end_token, matches]] = Parsing.collect_tokens(token, (token, deferred_matches) => {
                let token_symbol = token.symbol;
                let token_is_space = token_symbol == ' ';
                let token_has_symbol = has_symbols.test(token_symbol);
                if (has_letters.test(token_symbol))
                    return Parsing.collect_tokens.Control.INVALID;
                else if (has_numbers.test(token_symbol)) {
                    total_num_length += token_symbol.replace(/\D+/g, '').length;
                    if (total_num_length > max_number_length)
                        return Parsing.collect_tokens.Control.INVALID;
                    number_value += deferred_text + token_symbol;
                    deferred_text = '';
                    if (total_num_length > min_number_length) {
                        last_seen_number = token;
                        if (validate_phone_number(number_value))
                            return Parsing.collect_tokens.Control.MATCH_AND_CONTINUE;
                    }
                    return Parsing.collect_tokens.Control.VALID;
                }
                else if (token_has_symbol || token_is_space) {
                    if (deferred_matches.length == 5) //+31 - ( >^06)
                        return Parsing.collect_tokens.Control.INVALID;
                    deferred_text += token_symbol;
                    return Parsing.collect_tokens.Control.DEFER_VALID;
                }
                return Parsing.collect_tokens.Control.INVALID;
            });
            if (!matched || (last_seen_number != end_token && matches.length > 3)) // includes space
             {
                return [[], new Parsing.CoreClassificationScore(0.0, 0.0, this)];
            }
            else {
                let is_06_number = is_06(number_value);
                let score = (is_06_number ? 0.75 : 0.25);
                let severity_sum = (is_06_number ? 0.35 : 0.25);
                let assoc_sum = 0.0;
                let [assoc_sum_, severity_sum_] = Parsing.calc_assoc_severity_sum(start_token, end_token, this, this.language_model, this.language_model.max_assoc_distance);
                assoc_sum += assoc_sum_;
                severity_sum += severity_sum_;
                return [matches, new Parsing.CoreClassificationScore(Math.min(score + assoc_sum, 1.0), Math.min(severity_sum, 1.0), this)];
            }
        }
        else {
            return [[], new Parsing.CoreClassificationScore(0.0, 0.0, this)];
        }
    }
}
;
//# sourceMappingURL=phone-number.js.map