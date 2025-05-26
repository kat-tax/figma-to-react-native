export function toGCD(numbers: number[]): number {
  if (numbers.length === 0) return 50;
  if (numbers.length === 1) return Math.max(numbers[0], 4);
  const process = (a: number, b: number): number =>
    b === 0 ? a : process(b, a % b);
  let result = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    result = process(result, numbers[i]);
    if (result === 1) break;
  }
  return Math.max(result, 4);
}

export function toInt(val: string | number, init: number = 1): number {
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? init : parsed;
}

export function toFloat(val: string | number, init: number = 1): number {
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? init : parsed;
}

export function toTrimmed(val: string): string {
  return val.trim().replace(/\s+/g, ' ');
}

export function toCssUnit(val: string): boolean {
  return /^(\d+(?:\.\d+)?)(px|fr|%|em|rem|vw|vh)$/.test(val.trim());
}

export function toCssTransform(val: string): {number: number; unit: string} | null {
  const match = val.trim().match(/^(\d+(?:\.\d+)?)([a-z%]+)$/);
  if (match) {
    return {
      number: parseFloat(match[1]),
      unit: match[2],
    };
  }
  return null;
}
