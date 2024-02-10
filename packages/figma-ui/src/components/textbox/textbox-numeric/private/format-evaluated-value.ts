const EMPTY_STRING = '';
const regexNonDigit = /[^\d.]/
const regexFractional = /\.([^.]+)/

export function formatEvaluatedValue(evalValue: null | number, value: string, suffix?: string): string {
  if (evalValue === null)
    return EMPTY_STRING;
  const sigFigCount = countSignificantFigures(regexNonDigit.test(value) ? `${evalValue}` : value)
  return appendSuffix(formatSignificantFigures(evalValue, sigFigCount), suffix)
}

function countSignificantFigures(value: string): number {
  const result = regexFractional.exec(value);
  if (result === null)
    return 0;
  return result[1].length;
}

function formatSignificantFigures(value: number, sigFigCount: number): string {
  if (sigFigCount === 0)
    return `${value}`;
  const result = regexFractional.exec(`${value}`)
  if (result === null)
    return `${value}.${'0'.repeat(sigFigCount)}`;
  const fractionalPart = result[1];
  const count = sigFigCount - fractionalPart.length;
  return `${value}${'0'.repeat(count)}`;
}

function appendSuffix(string: string, suffix?: string): string {
  if (typeof suffix === 'undefined')
    return string;
  if (string === EMPTY_STRING)
    return EMPTY_STRING;
  return `${string}${suffix}`;
}
