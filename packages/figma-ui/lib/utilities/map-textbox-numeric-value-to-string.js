import { MIXED_NUMBER, MIXED_STRING } from './mixed-values';
export function mapTextboxNumericValueToString(value) {
    if (value === null)
        return '';
    if (value === MIXED_NUMBER)
        return MIXED_STRING;
    return `${value}`;
}
//# sourceMappingURL=map-textbox-numeric-value-to-string.js.map