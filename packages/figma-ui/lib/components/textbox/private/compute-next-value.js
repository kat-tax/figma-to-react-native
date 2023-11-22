export function computeNextValue(inputElement, insertedString) {
    const value = inputElement.value;
    const selectionStart = inputElement.selectionStart;
    const selectionEnd = inputElement.selectionEnd;
    return `${value.substring(0, selectionStart === null ? 0 : selectionStart)}${insertedString}${value.substring(selectionEnd === null ? 0 : selectionEnd)}`;
}
//# sourceMappingURL=compute-next-value.js.map