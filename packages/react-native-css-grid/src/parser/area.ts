import * as utils from 'utils';
import * as values from 'parser/values';
import type {GridItemData, GridColumnInfo, GridGaps, GridPosition} from 'types';

/**
 * Calculate column sizes from grid-template-columns
 */
export function cols(
  templateColumns: string,
  containerWidth: number,
  columnGap: number,
): number[] {
  const {
    totalFr,
    columnSizes,
    hasFractionalUnits,
    maxColumnRatioUnits,
  } = values.templateColumns(templateColumns);
  // Has explicit pixel sizes
  if (columnSizes.length > 0) return columnSizes;

  // Determine container viewport
  const viewport = containerWidth - (maxColumnRatioUnits - 1) * columnGap;

  // Calculate from fractional units
  if (hasFractionalUnits) return new Array(maxColumnRatioUnits).fill(viewport / totalFr);

  // Fallback: equal distribution
  return new Array(maxColumnRatioUnits).fill(viewport / maxColumnRatioUnits);
}

/**
 * Calculate row sizes from grid-template-rows
 */
export function rows(
  gridTemplateRows: string,
  containerHeight: number,
  rowGap: number,
): number[] {
  // For now, return empty array - row sizing will be auto-calculated
  // This could be enhanced to parse grid-template-rows similar to columns
  // TODO: Implement this
  return [];
}

/**
 * Parse gap values from CSS Grid gap properties
 */
export function gaps(
  gap?: string | number,
  rowGap?: string | number,
  columnGap?: string | number,
): GridGaps {
  const fallback = typeof gap === 'number'
    ? gap
    : utils.toFloat(String(gap), 0);
  return {
    row: rowGap !== undefined
      ? typeof rowGap === 'number'
        ? rowGap
        : utils.toFloat(String(rowGap), 0)
      : fallback,
    col: columnGap !== undefined
      ? typeof columnGap === 'number'
        ? columnGap
        : utils.toFloat(String(columnGap), 0)
      : fallback,
  };
}

/**
 * Calculate total height based on grid items
 */
export function height(
  maxRow: number,
  rowSizes: number[],
  rowGap: number,
  // TODO: is this needed?
  gridItems: GridItemData[],
): number {
  return rowSizes.length > 0
    ? rowSizes.reduce((sum, size) => sum + size, 0)
      + (rowSizes.length - 1) * rowGap
    : maxRow * 100 + (maxRow - 1) * rowGap;
}

/**
 * Calculate total width based on column sizes
 */
export function width(columnSizes: number[], columnGap: number): number {
  return columnSizes.length > 0
    ? columnSizes.reduce((sum, size) => sum + size, 0)
      + (columnSizes.length - 1) * columnGap
    : 0;
}

/**
 * Calculate optimal itemSizeUnit based on grid configuration
 */
export function unitSize(
  templateColumns: string,
  containerWidth?: number,
  columnInfo?: GridColumnInfo
): number {
  const info = columnInfo || values.templateColumns(templateColumns);

  // Method 1: Use GCD of explicit pixel sizes
  if (info.hasExplicitSizes && info.columnSizes.length > 0) {
    return utils.toGCD(info.columnSizes);
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
 * Parse grid-area value for positioning
 */
export function position(value: string): GridPosition {
  if (!value || typeof value !== 'string') {
    return {
      columnStart: 0,
      columnEnd: 0,
      rowStart: 0,
      rowEnd: 0,
    };
  }
  const parts = value.split('/').map(s => s.trim());
  if (parts.length === 4) {
    const [rowStart, colStart, rowEnd, colEnd] = parts;
    return {
      columnStart: utils.toInt(colStart, 0),
      columnEnd: utils.toInt(colEnd, 0),
      rowStart: utils.toInt(rowStart, 0),
      rowEnd: utils.toInt(rowEnd, 0),
    };
  }
  return {
    columnStart: 0,
    columnEnd: 0,
    rowStart: 0,
    rowEnd: 0,
  };
}
