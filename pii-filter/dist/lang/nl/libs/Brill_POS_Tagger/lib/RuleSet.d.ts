export = RuleSet;
declare function RuleSet(language: any): void;
declare class RuleSet {
    constructor(language: any);
    rules: {};
    addRule(rule: any): boolean;
    removeRule(rule: any): void;
    getRules(): any[];
    nrRules(): number;
    hasRule(rule: any): boolean;
    prettyPrint(): string;
}
//# sourceMappingURL=RuleSet.d.ts.map