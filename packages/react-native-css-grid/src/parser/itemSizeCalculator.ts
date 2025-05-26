/**
 * Item size calculation utilities
 */

import { toGCD } from '../utils';
import { parseTemplateColumns } from './columnTemplates';
import type { GridColumnInfo } from '../types';

/**
 * Calculate optimal itemSizeUnit based on grid configuration
 */
export function calculateItemSizeUnit(
  gridTemplateColumns: string,
  containerWidth?: number,
  columnInfo?: GridColumnInfo
): number {
  const info = columnInfo || parseTemplateColumns(gridTemplateColumns);

  // Method 1: Use GCD of explicit pixel sizes
  if (info.hasExplicitSizes && info.columnSizes.length > 0) {
    return toGCD(info.columnSizes);
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
