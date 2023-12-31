import {floatOperandRegex, integerOperandRegex, operatorRegex} from './private/regex';

/**
 * Checks if `value` is a numeric expression, as input by a user. “Partial”
 * inputs are considered valid.
 *
 * @param options.integersOnly  Set to `true` to check that the expression
 * contains only integers. Defaults to `false`.
 * @returns Returns `true` if `value` is a valid numeric expression,
 * else `false`.
 * @category Number
 */
export function isValidNumericInput(
  value: string,
  options: {integersOnly: boolean} = {integersOnly: false}
): boolean {
  let i = -1;
  const split = (value[0] === '-'
    ? value.substring(1)
    : value).split(operatorRegex);
  while (++i < split.length) {
    const operand = split[i];
    if (
      (operand === '' && i !== split.length - 1) ||
      (options.integersOnly
        ? integerOperandRegex
        : floatOperandRegex
      ).test(operand) === false
    ) {
      return false;
    }
  }
  return true;
}
