import { DutchPOSTagger } from './pos-tagger';
import { DutchStemmer } from './stemmer';
import ds_severity_mapping from './dataset/ds_severity.json';
import * as DutchClassifiers from './classifiers';
import * as Parsing from '../../core/parsing';
/**
 * These classifiers exist for the Dutch language.
 * @public
 */
export var classifiers;
(function (classifiers) {
    /** matches first names */
    classifiers[classifiers["first_name"] = 0] = "first_name";
    /** matches family names */
    classifiers[classifiers["family_name"] = 1] = "family_name";
    /** matches pet names */
    classifiers[classifiers["pet_name"] = 2] = "pet_name";
    /** matches medicine names */
    classifiers[classifiers["medicine_name"] = 3] = "medicine_name";
    /** matches email addresses */
    classifiers[classifiers["email_address"] = 4] = "email_address";
    /** matches phone numbers */
    classifiers[classifiers["phone_number"] = 5] = "phone_number";
    /** matches dates */
    classifiers[classifiers["date"] = 6] = "date";
})(classifiers || (classifiers = {}));
;
/**
 * Create a new Dutch language model.
 * @public
 * @param classifier_enums a list of classifiers to use, if not specified, all will be used
 */
export function make_lm(classifier_enums) {
    if (classifier_enums == null) {
        return new NL();
    }
    else {
        let classifier_instances = new Map();
        for (let classifier_enum of classifier_enums) {
            function add_classifier(classifier) {
                if (!classifier_instances.has(classifier_enum))
                    classifier_instances.set(classifier_enum, classifier);
                else
                    throw new Error(`Multiple instances of {${classifier.name}}.`);
            }
            ;
            switch (classifier_enum) {
                case classifiers.first_name:
                    add_classifier(new DutchClassifiers.FirstName);
                    break;
                case classifiers.family_name:
                    add_classifier(new DutchClassifiers.FamilyName);
                    break;
                case classifiers.pet_name:
                    add_classifier(new DutchClassifiers.PetName);
                    break;
                case classifiers.medicine_name:
                    add_classifier(new DutchClassifiers.MedicineName);
                    break;
                case classifiers.email_address:
                    add_classifier(new DutchClassifiers.EmailAddress);
                    break;
                case classifiers.phone_number:
                    add_classifier(new DutchClassifiers.PhoneNumber);
                    break;
                case classifiers.date:
                    add_classifier(new DutchClassifiers.Date);
                    break;
                default:
                    throw new Error(`The classifier ${classifier_enum} does not exist.`);
                    break;
            }
            ;
        }
        return new NL(Array.from(classifier_instances.values()));
    }
}
/**
 * A Dutch language model.
 * @private
 */
class NL {
    /**
     * Creates a new Dutch language model.
     * @param classifiers a list of classifiers, if not specified, all will be used
     */
    constructor(classifiers = [
        new DutchClassifiers.FirstName(),
        new DutchClassifiers.FamilyName(),
        new DutchClassifiers.PetName(),
        new DutchClassifiers.MedicineName(),
        new DutchClassifiers.EmailAddress(),
        new DutchClassifiers.PhoneNumber(),
        new DutchClassifiers.Date(),
    ]) {
        this.classifiers = classifiers;
        this.stemmer = new DutchStemmer();
        this.pos_tagger = new DutchPOSTagger();
        this.punctuation_map = new Map();
        this.max_assoc_distance = 30;
        this.dictionary = new DutchClassifiers.Dictionary();
        this.thresholds = new Parsing.CoreThresholds(0.025, new Parsing.CoreThresholds.Group(0.2, 0.0, true), new Parsing.CoreThresholds.Group(0.045, 0.0, false));
        // distance multipliers
        this.punctuation_map.set('.', 0.25);
        this.punctuation_map.set('!', 0.25);
        this.punctuation_map.set('?', 0.25);
        this.punctuation_map.set(';', 0.75);
        this.punctuation_map.set(' ', 0.9);
        this.punctuation_map.set(',', 1.0);
        this.punctuation_map.set(':', 1.0);
        this.punctuation_map.set('=', 1.0);
        this.punctuation_map.set('-', 1.0);
        this.punctuation_map.set('_', 1.0);
        this.punctuation_map.set('/', 1.0);
        this.punctuation_map.set('\\', 1.0);
        this.punctuation_map.set('(', 1.0);
        this.punctuation_map.set(')', 1.0);
        this.punctuation_map.set('[', 1.0);
        this.punctuation_map.set(']', 1.0);
        this.punctuation_map.set('\n', 0.0);
        let r_str = '';
        let first = true;
        for (let punc of this.punctuation_map.keys()) {
            r_str += (first ? '' : '|') + '\\' + punc;
            first = false;
        }
        this.punctuation = new RegExp(`(${r_str})`, 'g');
        // initialize classifiers
        for (let classifier of this.classifiers)
            classifier.init(this);
        // ---- severity mapping
        this.severity_mappings = new Array();
        for (let mapping of ds_severity_mapping) {
            let classifier_map = new Map();
            for (let pii of mapping.pii) {
                // let found = false;
                for (let classifier of this.classifiers) {
                    if (pii === classifier.name) {
                        if (!classifier_map.has(classifier))
                            classifier_map.set(classifier, 0);
                        classifier_map.set(classifier, classifier_map.get(classifier) + 1);
                        // found = true;
                        break;
                    }
                }
            }
            this.severity_mappings.push({ classifiers: classifier_map, severity: mapping.severity });
        }
    }
}
;
//# sourceMappingURL=nl.js.map