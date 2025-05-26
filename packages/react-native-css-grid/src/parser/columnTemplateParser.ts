/**
 * CSS Grid Template Columns Parser
 * Converts CSS grid-template-columns to FlexGrid configuration
 */

import { normalizeWhitespace, parseFloatWithFallback } from './utils';
import type { ColumnInfo, ColumnPattern } from './types';

/**
 * Parse CSS grid-template-columns string
 */
export function parseGridTemplateColumns(
  gridTemplateColumns: string,
  containerWidth?: number
): ColumnInfo {
  if (!gridTemplateColumns || gridTemplateColumns === 'none') {
    return {
      maxColumnRatioUnits: 12,
      columnSizes: [],
      hasExplicitSizes: false,
      hasFractionalUnits: false,
      totalFr: 0
    };
  }

  const normalized = normalizeWhitespace(gridTemplateColumns);
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
        const patternInfo = parseColumnPattern(pattern);
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
      const remainingInfo = parseColumnPattern(withoutRepeats);
      columnCount += remainingInfo.count;
      explicitSizes.push(...remainingInfo.sizes);
      totalFr += remainingInfo.fr;
    }
  } else {
    // No repeat functions, parse directly
    const patternInfo = parseColumnPattern(normalized);
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

/**
 * Parse a column pattern (without repeat)
 */
export function parseColumnPattern(pattern: string): ColumnPattern {
  const sizes: number[] = [];
  let fr = 0;

  // Split by whitespace and filter valid values
  const parts = pattern.split(/\s+/).filter(part => {
    const trimmed = part.trim();
    return trimmed && trimmed !== '';
  });

  for (const part of parts) {
    // Extract pixel values
    const pxMatch = part.match(/^(\d+(?:\.\d+)?)px$/);
    if (pxMatch) {
      sizes.push(parseFloatWithFallback(pxMatch[1], 0));
      continue;
    }

    // Extract fractional units
    const frMatch = part.match(/^(\d+(?:\.\d+)?)fr$/);
    if (frMatch) {
      fr += parseFloatWithFallback(frMatch[1], 0);
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

  return {
    count: parts.length,
    sizes,
    fr
  };
}
