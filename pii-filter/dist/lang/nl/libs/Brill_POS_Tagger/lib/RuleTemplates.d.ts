export = ruleTemplates;
declare var ruleTemplates: {
    "NEXT-TAG": {
        function: typeof next_tag_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof nextTagParameterValues;
    };
    "NEXT-WORD-IS-CAP": {
        function: typeof next_word_is_cap;
        window: number[];
        nrParameters: number;
    };
    "PREV-1-OR-2-OR-3-TAG": {
        function: typeof prev_1_or_2_or_3_tag;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof prev1Or2Or3TagParameterValues;
    };
    "PREV-1-OR-2-TAG": {
        function: typeof prev_1_or_2_tag;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof prev1Or2TagParameterValues;
    };
    "NEXT-WORD-IS-TAG": {
        function: typeof next_tag_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof nextTagParameterValues;
    };
    "PREV-TAG": {
        function: typeof prev_tag_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof prevTagParameterValues;
    };
    "PREV-WORD-IS-CAP": {
        function: typeof prev_word_is_cap;
        window: number[];
        nrParameters: number;
    };
    "CURRENT-WORD-IS-CAP": {
        function: typeof current_word_is_cap;
        window: number[];
        nrParameters: number;
    };
    "CURRENT-WORD-IS-NUMBER": {
        function: typeof current_word_is_number;
        window: number[];
        nrParameters: number;
    };
    "CURRENT-WORD-IS-URL": {
        function: typeof current_word_is_url;
        window: number[];
        nrParameters: number;
    };
    "CURRENT-WORD-ENDS-WITH": {
        function: typeof current_word_ends_with;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof currentWordEndsWithParameterValues;
    };
    "PREV-WORD-IS": {
        function: typeof prev_word_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof prevWordParameterValues;
    };
    PREVTAG: {
        function: typeof prev_tag_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof prevTagParameterValues;
    };
    NEXT1OR2TAG: {
        function: typeof next_1_or_2_tag_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof next1Or2TagIsParameterValues;
    };
    NEXTTAG: {
        function: typeof next_tag_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof nextTagParameterValues;
    };
    PREV1OR2TAG: {
        function: typeof prev_1_or_2_tag;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof prev1Or2TagParameterValues;
    };
    WDAND2TAGAFT: {
        function: typeof current_word_and_2_tag_after_are;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof currentWordParameterValues;
        parameter2Values: typeof twoTagAfterParameterValues;
    };
    NEXT1OR2OR3TAG: {
        function: typeof next_1_or_2_or_3_tag;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof next1Or2Or3TagParameterValues;
    };
    CURWD: {
        function: typeof current_word_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof currentWordParameterValues;
    };
    SURROUNDTAG: {
        function: typeof surrounded_by_tags;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof prevTagParameterValues;
        parameter2Values: typeof nextTagParameterValues;
    };
    PREV1OR2OR3TAG: {
        function: typeof prev_1_or_2_or_3_tag;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof prev1Or2Or3TagParameterValues;
    };
    WDNEXTTAG: {
        function: typeof current_word_and_next_tag_are;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof currentWordParameterValues;
        parameter2Values: typeof nextTagParameterValues;
    };
    PREV1OR2WD: {
        function: typeof prev_1_or_2_word_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof prev1Or2WordParameterValues;
    };
    NEXTWD: {
        function: typeof next_word_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof nextWordParameterValues;
    };
    PREVWD: {
        function: typeof prev_word_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof prevWordParameterValues;
    };
    NEXT2TAG: {
        function: typeof next_2_tag_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof next2TagParameterValues;
    };
    WDAND2TAGBFR: {
        function: typeof current_word_and_2_tag_before_are;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof currentWordParameterValues;
        parameter2Values: typeof twoTagBeforeParameterValues;
    };
    WDAND2AFT: {
        function: typeof current_word_and_2_after_are;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof currentWordParameterValues;
        parameter2Values: typeof twoTagAfterParameterValues;
    };
    WDPREVTAG: {
        function: typeof current_word_and_prev_tag_are;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof currentWordParameterValues;
        parameter2Values: typeof prevTagParameterValues;
    };
    RBIGRAM: {
        function: typeof right_bigram_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof currentWordParameterValues;
        parameter2Values: typeof nextWordParameterValues;
    };
    LBIGRAM: {
        function: typeof left_bigram_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof prevWordParameterValues;
        parameter2Values: typeof currentWordParameterValues;
    };
    NEXTBIGRAM: {
        function: typeof next_bigram_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof nextWordParameterValues;
        parameter2Values: typeof twoWordAfterParameterValues;
    };
    PREVBIGRAM: {
        function: typeof prev_bigram_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof twoWordBeforeParameterValues;
        parameter2Values: typeof prevWordParameterValues;
    };
    PREV2TAG: {
        function: typeof prev_2_tag_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof twoTagBeforeParameterValues;
        parameter2Values: typeof prevTagParameterValues;
    };
    NEXT1OR2WD: {
        function: typeof next_1_or_2_word_is;
        window: number[];
        nrParameters: number;
        parameter1Values: typeof next1Or2WordParameterValues;
    };
    DEFAULT: {
        function: typeof default_predicate;
        window: number[];
        nrParameters: number;
    };
};
declare function next_tag_is(sentence: any, i: any, parameter: any): boolean;
declare function nextTagParameterValues(sentence: any, i: any): any[];
declare function next_word_is_cap(sentence: any, i: any, parameter: any): boolean;
declare function prev_1_or_2_or_3_tag(sentence: any, i: any, parameter: any): boolean;
declare function prev1Or2Or3TagParameterValues(sentence: any, i: any): any[];
declare function prev_1_or_2_tag(sentence: any, i: any, parameter: any): boolean;
declare function prev1Or2TagParameterValues(sentence: any, i: any): any[];
declare function prev_tag_is(sentence: any, i: any, parameter: any): boolean;
declare function prevTagParameterValues(sentence: any, i: any): any[];
declare function prev_word_is_cap(sentence: any, i: any, parameter: any): boolean;
declare function current_word_is_cap(sentence: any, i: any, parameter: any): boolean;
declare function current_word_is_number(sentence: any, i: any, parameter: any): boolean;
declare function current_word_is_url(sentence: any, i: any, parameter: any): boolean;
declare function current_word_ends_with(sentence: any, i: any, parameter: any): boolean;
declare function currentWordEndsWithParameterValues(sentence: any, i: any): string[];
declare function prev_word_is(sentence: any, i: any, parameter: any): boolean;
declare function prevWordParameterValues(sentence: any, i: any): any[];
declare function next_1_or_2_tag_is(sentence: any, i: any, parameter: any): boolean;
declare function next1Or2TagIsParameterValues(sentence: any, i: any): any[];
declare function current_word_and_2_tag_after_are(sentence: any, i: any, parameter1: any, parameter2: any): boolean;
declare function currentWordParameterValues(sentence: any, i: any): any[];
declare function twoTagAfterParameterValues(sentence: any, i: any): any[];
declare function next_1_or_2_or_3_tag(sentence: any, i: any, parameter: any): boolean;
declare function next1Or2Or3TagParameterValues(sentence: any, i: any): any[];
declare function current_word_is(sentence: any, i: any, parameter: any): boolean;
declare function surrounded_by_tags(sentence: any, i: any, parameter1: any, parameter2: any): boolean;
declare function current_word_and_next_tag_are(sentence: any, i: any, parameter1: any, parameter2: any): boolean;
declare function prev_1_or_2_word_is(sentence: any, i: any, parameter: any): boolean;
declare function prev1Or2WordParameterValues(sentence: any, i: any): any[];
declare function next_word_is(sentence: any, i: any, parameter: any): boolean;
declare function nextWordParameterValues(sentence: any, i: any): any[];
declare function next_2_tag_is(sentence: any, i: any, parameter: any): boolean;
declare function next2TagParameterValues(sentence: any, i: any): any[];
declare function current_word_and_2_tag_before_are(sentence: any, i: any, parameter1: any, parameter2: any): boolean;
declare function twoTagBeforeParameterValues(sentence: any, i: any): any[];
declare function current_word_and_2_after_are(sentence: any, i: any, parameter1: any, parameter2: any): boolean;
declare function current_word_and_prev_tag_are(sentence: any, i: any, parameter1: any, parameter2: any): boolean;
declare function right_bigram_is(sentence: any, i: any, parameter1: any, parameter2: any): boolean;
declare function left_bigram_is(sentence: any, i: any, parameter1: any, parameter2: any): boolean;
declare function next_bigram_is(sentence: any, i: any, parameter1: any, parameter2: any): boolean;
declare function twoWordAfterParameterValues(sentence: any, i: any): any[];
declare function prev_bigram_is(sentence: any, i: any, parameter1: any, parameter2: any): boolean;
declare function twoWordBeforeParameterValues(sentence: any, i: any): any[];
declare function prev_2_tag_is(sentence: any, i: any, parameter: any): boolean;
declare function next_1_or_2_word_is(sentence: any, i: any, parameter1: any, parameter2: any): boolean;
declare function next1Or2WordParameterValues(sentence: any, i: any): any[];
declare function default_predicate(sentence: any, i: any, parameter: any): boolean;
//# sourceMappingURL=RuleTemplates.d.ts.map