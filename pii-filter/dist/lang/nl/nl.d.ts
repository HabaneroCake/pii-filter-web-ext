import { Language } from '../../core/interfaces';
/**
 * These classifiers exist for the Dutch language.
 * @public
 */
export declare enum classifiers {
    /** matches first names */
    first_name = 0,
    /** matches family names */
    family_name = 1,
    /** matches pet names */
    pet_name = 2,
    /** matches medicine names */
    medicine_name = 3,
    /** matches email addresses */
    email_address = 4,
    /** matches phone numbers */
    phone_number = 5,
    /** matches dates */
    date = 6
}
/**
 * Create a new Dutch language model.
 * @public
 * @param classifier_enums a list of classifiers to use, if not specified, all will be used
 */
export declare function make_lm(classifier_enums?: Array<classifiers>): Language;
//# sourceMappingURL=nl.d.ts.map