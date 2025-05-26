/**
 * Item size calculation utilities
 */

import { calculateGCD } from '../utils';
import { parseTemplateColumns } from './columnTemplates';
import type { ColumnInfo } from '../types';

/**
 * Calculate optimal itemSizeUnit based on grid configuration
 */
export function calculateItemSizeUnit(
  gridTemplateColumns: string,
  containerWidth?: number,
  columnInfo?: ColumnInfo
): number {
  const info = columnInfo || parseTemplateColumns(gridTemplateColumns, containerWidth);

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
