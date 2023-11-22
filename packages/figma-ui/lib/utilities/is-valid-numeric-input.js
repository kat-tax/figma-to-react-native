import { floatOperandRegex, integerOperandRegex, operatorRegex } from './private/regex';
export function isValidNumericInput(value, options = { integersOnly: false }) {
    const split = (value[0] === '-' ? value.substring(1) : value).split(operatorRegex);
    let i = -1;
    while (++i < split.length) {
        const operand = split[i];
        if ((operand === '' && i !== split.length - 1) ||
            (options.integersOnly === true
                ? integerOperandRegex
                : floatOperandRegex).test(operand) === false) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=is-valid-numeric-input.js.map