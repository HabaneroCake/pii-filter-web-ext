export = Brill_POS_Tagger;
declare function Brill_POS_Tagger(lexicon: any, ruleSet: any): void;
declare class Brill_POS_Tagger {
    constructor(lexicon: any, ruleSet: any);
    lexicon: any;
    ruleSet: any;
    tag(sentence: any): any;
    tagWithLexicon(sentence: any): import("./Sentence");
    applyRules(sentence: any): any;
}
//# sourceMappingURL=Brill_POS_Tagger.d.ts.map