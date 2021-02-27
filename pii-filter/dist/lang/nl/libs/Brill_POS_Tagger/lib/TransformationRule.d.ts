export = TransformationRule;
declare function TransformationRule(c1: any, c2: any, predicate: any, parameter1: any, parameter2: any): void;
declare class TransformationRule {
    constructor(c1: any, c2: any, predicate: any, parameter1: any, parameter2: any);
    literal: any[];
    predicate: import("./Predicate");
    old_category: any;
    new_category: any;
    neutral: number;
    negative: number;
    positive: number;
    hasBeenSelectedAsHighRuleBefore: boolean;
    key(): string;
    apply(sentence: any, position: any): void;
    isApplicableAt(sentence: any, taggedSentence: any, i: any): any;
    prettyPrint(): string;
    applyAt(sentence: any, i: any): void;
    score(): number;
}
//# sourceMappingURL=TransformationRule.d.ts.map