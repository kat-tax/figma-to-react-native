import {toTrimmed, toFloat, toInt} from 'utils';
import type {GridColumnInfo, GridColumnPattern} from 'types';

/**
 * Parses the Grid CSS span value syntax
 * @example
 * ```tsx
 * 'span 2' // 2
 * '1 / 3' // 2
 * '2' // 2
 * ```
 */
export function span(input: string): number {
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
export function area(value: string): { widthRatio: number; heightRatio: number } {
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
export function startEnd(
  start: string | number,
  end: string | number,
): number {
  return Math.max(1, toInt(end, 1) - toInt(start, 1));
}

export function templateColumns(tpl: string): GridColumnInfo {
  if (!tpl || tpl === 'none') {
    return {
      maxColumnRatioUnits: 12,
      columnSizes: [],
      hasExplicitSizes: false,
      hasFractionalUnits: false,
      totalFr: 0
    };
  }

  const columnPattern = (format: string): GridColumnPattern => {
    let fr = 0;
    const sizes: number[] = [];
    // Split by whitespace and filter valid values
    const parts = format.split(/\s+/).filter(part => {
      const trimmed = part.trim();
      return trimmed && trimmed !== '';
    });
    for (const part of parts) {
      // Extract pixel values
      const pxMatch = part.match(/^(\d+(?:\.\d+)?)px$/);
      if (pxMatch) {
        sizes.push(toFloat(pxMatch[1], 0));
        continue;
      }
      // Extract fractional units
      const frMatch = part.match(/^(\d+(?:\.\d+)?)fr$/);
      if (frMatch) {
        fr += toFloat(frMatch[1], 0);
        continue;
      }
      // Handle other valid CSS values (auto, min-content, etc.)
      if (['auto', 'min-content', 'max-content'].includes(part)) {
        // Count as one column but no explicit size
        continue;
      }
      // Handle functions like minmax(), fit-content()
      if (part.includes('(') && part.includes(')')) {
        // Count as one column but no explicit size
        continue;
      }
    }
    return {count: parts.length, sizes, fr};
  }

  const normalized = toTrimmed(tpl);
  const explicitSizes: number[] = [];

  let totalFr = 0;
  let columnCount = 0;

  // Handle repeat() functions
  const repeatMatches = normalized.match(/repeat\s*\(\s*(\d+)\s*,\s*([^)]+)\)/g);
  if (repeatMatches) {
    for (const match of repeatMatches) {
      const repeatContent = match.match(/repeat\s*\(\s*(\d+)\s*,\s*([^)]+)\)/);
      if (repeatContent) {
        const [, count, pattern] = repeatContent;
        const repeatCount = parseInt(count, 10);

        // Parse pattern for sizes
        const patternInfo = columnPattern(pattern);
        columnCount += repeatCount * patternInfo.count;

        // Multiply sizes by repeat count
        for (let i = 0; i < repeatCount; i++) {
          explicitSizes.push(...patternInfo.sizes);
        }
        totalFr += patternInfo.fr * repeatCount;
      }
    }

    // Remove repeat() from string and parse remaining
    const withoutRepeats = normalized.replace(/repeat\s*\([^)]+\)/g, '').trim();
    if (withoutRepeats) {
      const remainingInfo = columnPattern(withoutRepeats);
      columnCount += remainingInfo.count;
      explicitSizes.push(...remainingInfo.sizes);
      totalFr += remainingInfo.fr;
    }
  } else {
    // No repeat functions, parse directly
    const patternInfo = columnPattern(normalized);
    columnCount = patternInfo.count;
    explicitSizes.push(...patternInfo.sizes);
    totalFr = patternInfo.fr;
  }

  return {
    maxColumnRatioUnits: Math.max(1, columnCount),
    columnSizes: explicitSizes,
    hasExplicitSizes: explicitSizes.length > 0,
    hasFractionalUnits: totalFr > 0,
    totalFr
  };
}
