import {toInt} from '../utils';

/**
 * Parses the Grid CSS span value syntax
 * @example
 * ```tsx
 * 'span 2' // 2
 * '1 / 3' // 2
 * '2' // 2
 * ```
 */
export function parseGridSpan(input: string): number {
  if (!input || typeof input !== 'string') return 1;
  const value = input.trim();
  // Handle span syntax: "span 2"
  const match = value.match(/span\s+(\d+)/);
  if (match) return toInt(match[1], 1);
  // Handle range syntax: "1 / 3"
  if (value.includes('/')) {
    const [start, end] = value.split('/').map(s => s.trim());
    const from = toInt(start, 1);
    const to = toInt(end, 1);
    return Math.max(1, to - from);
  }
  // Handle single number
  const num = toInt(value, 1);
  return Math.max(1, num);
}

/**
 * Parse grid-area value (row-start / column-start / row-end / column-end)
 */
export function parseGridArea(value: string): { widthRatio: number; heightRatio: number } {
  if (!value || typeof value !== 'string') {
    return {widthRatio: 1, heightRatio: 1};
  }
  const parts = value.split('/').map(s => s.trim());
  if (parts.length === 4) {
    const [rowStart, colStart, rowEnd, colEnd] = parts;
    const rowStartNum = toInt(rowStart, 1);
    const colStartNum = toInt(colStart, 1);
    const rowEndNum = toInt(rowEnd, 1);
    const colEndNum = toInt(colEnd, 1);
    const widthRatio = Math.max(1, colEndNum - colStartNum);
    const heightRatio = Math.max(1, rowEndNum - rowStartNum);
    return {widthRatio, heightRatio};
  }
  // If not 4 parts, treat as named area (default to 1x1)
  return {widthRatio: 1, heightRatio: 1};
}

/**
 * Parse grid column/row start and end values
 */
export function parseGridStartEnd(
  start: string | number,
  end: string | number,
): number {
  return Math.max(1, toInt(end, 1) - toInt(start, 1));
}
