/**
 * Grid span parsing utilities
 */

import { parseIntWithFallback } from './utils';

/**
 * Parse grid span value (e.g., "span 2", "1 / 3", "2")
 */
export function parseGridSpan(value: string): number {
  if (!value || typeof value !== 'string') return 1;

  const strValue = value.trim();

  // Handle span syntax: "span 2"
  const spanMatch = strValue.match(/span\s+(\d+)/);
  if (spanMatch) {
    return parseIntWithFallback(spanMatch[1], 1);
  }

  // Handle range syntax: "1 / 3"
  if (strValue.includes('/')) {
    const [start, end] = strValue.split('/').map(s => s.trim());
    const startNum = parseIntWithFallback(start, 1);
    const endNum = parseIntWithFallback(end, 1);
    return Math.max(1, endNum - startNum);
  }

  // Handle single number
  const singleNum = parseIntWithFallback(strValue, 1);
  return Math.max(1, singleNum);
}

/**
 * Parse grid-area value (row-start / column-start / row-end / column-end)
 */
export function parseGridArea(value: string): { widthRatio: number; heightRatio: number } {
  if (!value || typeof value !== 'string') {
    return { widthRatio: 1, heightRatio: 1 };
  }

  const parts = value.split('/').map(s => s.trim());

  if (parts.length === 4) {
    const [rowStart, colStart, rowEnd, colEnd] = parts;

    const rowStartNum = parseIntWithFallback(rowStart, 1);
    const colStartNum = parseIntWithFallback(colStart, 1);
    const rowEndNum = parseIntWithFallback(rowEnd, 1);
    const colEndNum = parseIntWithFallback(colEnd, 1);

    const widthRatio = Math.max(1, colEndNum - colStartNum);
    const heightRatio = Math.max(1, rowEndNum - rowStartNum);

    return { widthRatio, heightRatio };
  }

  // If not 4 parts, treat as named area (default to 1x1)
  return { widthRatio: 1, heightRatio: 1 };
}

/**
 * Parse grid column/row start and end values
 */
export function parseGridStartEnd(start: string | number, end: string | number): number {
  const startNum = parseIntWithFallback(start, 1);
  const endNum = parseIntWithFallback(end, 1);
  return Math.max(1, endNum - startNum);
}
