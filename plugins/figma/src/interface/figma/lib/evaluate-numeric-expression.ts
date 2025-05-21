import {invalidCharactersRegex, numbersRegex, operatorRegex, operatorSuffixRegex} from './private/regex';

/**
 * Evaluates the given numeric `expression`.
 *
 * @returns Returns the result of evaluating the given numeric `expression`,
 * else `null` for an invalid expression.
 * @category Number
 */
export function evaluateNumericExpression(value: string): null | number {
  if (value === ''
    || numbersRegex.test(value) === false
    || invalidCharactersRegex.test(value)) {
    return null;
  }
  if (operatorRegex.test(value)) {
    // Drop the operator suffix
    if (operatorSuffixRegex.test(value))
      return (0, eval)(value.substring(0, value.length - 1));
    return (0, eval)(value);
  }
  return parseFloat(value);
}
