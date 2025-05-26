/**
 * Utility functions for CSS Grid parsing
 */

/**
 * Calculate Greatest Common Divisor
 */
export function calculateGCD(numbers: number[]): number {
  if (numbers.length === 0) return 50;
  if (numbers.length === 1) return Math.max(numbers[0], 4);

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  let result = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    result = gcd(result, numbers[i]);
    if (result === 1) break;
  }

  return Math.max(result, 4);
}

/**
 * Parse integer value with fallback
 */
export function parseIntWithFallback(value: string | number, fallback: number = 1): number {
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Parse float value with fallback
 */
export function parseFloatWithFallback(value: string | number, fallback: number = 1): number {
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Normalize whitespace in CSS string
 */
export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Check if a value is a valid CSS unit
 */
export function isValidCSSUnit(value: string): boolean {
  return /^(\d+(?:\.\d+)?)(px|fr|%|em|rem|vw|vh)$/.test(value.trim());
}

/**
 * Extract numeric value and unit from CSS value
 */
export function extractCSSValue(value: string): { number: number; unit: string } | null {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)([a-z%]+)$/);
  if (match) {
    return {
      number: parseFloat(match[1]),
      unit: match[2]
    };
  }
  return null;
}
