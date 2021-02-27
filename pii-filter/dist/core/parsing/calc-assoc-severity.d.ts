import { Language } from '../interfaces/language';
import { Classifier } from '../interfaces/parsing/classification';
import { Token } from '../interfaces/parsing/tokens';
/**
 * sums the associative / severity scores for a classifier, taking into account punctuation distance
 * @private
 * @param left_it left iterator token for the midpoint
 * @param right_it right iterator token for the midpoint
 * @param classifier classifier to match
 * @param language_model language_model to use
 * @param max_steps number of steps to stop after
 */
export declare function calc_assoc_severity_sum(left_it: Token, right_it: Token, classifier: Classifier, language_model: Language, max_steps: number): [number, number];
//# sourceMappingURL=calc-assoc-severity.d.ts.map