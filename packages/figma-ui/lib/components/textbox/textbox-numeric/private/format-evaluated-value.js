const EMPTY_STRING = '';
const fractionalPartRegex = /\.([^.]+)/;
const nonDigitRegex = /[^\d.]/;
export function formatEvaluatedValue(evaluatedValue, value, suffix) {
    if (evaluatedValue === null) {
        return EMPTY_STRING;
    }
    const significantFiguresCount = countSignificantFigures(nonDigitRegex.test(value) === true ? `${evaluatedValue}` : value);
    return appendSuffix(formatSignificantFigures(evaluatedValue, significantFiguresCount), suffix);
}
function countSignificantFigures(value) {
    const result = fractionalPartRegex.exec(value);
    if (result === null) {
        return 0;
    }
    return result[1].length;
}
function formatSignificantFigures(value, significantFiguresCount) {
    if (significantFiguresCount === 0) {
        return `${value}`;
    }
    const result = fractionalPartRegex.exec(`${value}`);
    if (result === null) {
        return `${value}.${'0'.repeat(significantFiguresCount)}`;
    }
    const fractionalPart = result[1];
    const count = significantFiguresCount - fractionalPart.length;
    return `${value}${'0'.repeat(count)}`;
}
function appendSuffix(string, suffix) {
    if (typeof suffix === 'undefined') {
        return string;
    }
    if (string === EMPTY_STRING) {
        return EMPTY_STRING;
    }
    return `${string}${suffix}`;
}
//# sourceMappingURL=format-evaluated-value.js.map