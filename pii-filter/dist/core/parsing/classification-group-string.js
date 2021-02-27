/**
 * Converts a classification group into a string.
 * @private
 * @param classification the classification to convert
 */
export function classification_group_string(classification) {
    let text = '';
    let token = classification.group_root_start;
    do {
        text += token.symbol;
        if (token.index == classification.group_root_end.index)
            break;
        token = token.next;
    } while (token != null);
    return text;
}
//# sourceMappingURL=classification-group-string.js.map