/**
 * CSS Grid Template Columns Parser
 * Converts CSS grid-template-columns to FlexGrid configuration
 */

export interface ColumnInfo {
  maxColumnRatioUnits: number;
  columnSizes: number[];
  hasExplicitSizes: boolean;
  hasFractionalUnits: boolean;
  totalFr: number;
}

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

  const normalized = gridTemplateColumns.trim().replace(/\s+/g, ' ');
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
function parseColumnPattern(pattern: string): { count: number; sizes: number[]; fr: number } {
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
      sizes.push(parseFloat(pxMatch[1]));
      continue;
    }

    // Extract fractional units
    const frMatch = part.match(/^(\d+(?:\.\d+)?)fr$/);
    if (frMatch) {
      fr += parseFloat(frMatch[1]);
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

/**
 * Calculate optimal itemSizeUnit based on grid configuration
 */
export function calculateItemSizeUnit(
  gridTemplateColumns: string,
  containerWidth?: number,
  columnInfo?: ColumnInfo
): number {
  const info = columnInfo || parseGridTemplateColumns(gridTemplateColumns, containerWidth);

  // Method 1: Use GCD of explicit pixel sizes
  if (info.hasExplicitSizes && info.columnSizes.length > 0) {
    return calculateGCD(info.columnSizes);
  }

  // Method 2: Calculate from fractional units
  if (info.hasFractionalUnits && containerWidth && info.totalFr > 0) {
    return Math.floor(containerWidth / info.totalFr);
  }

  // Method 3: Divide container by column count
  if (containerWidth && info.maxColumnRatioUnits > 0) {
    return Math.floor(containerWidth / info.maxColumnRatioUnits);
  }

  // Fallback
  return 50;
}

/**
 * Calculate Greatest Common Divisor
 */
function calculateGCD(numbers: number[]): number {
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
