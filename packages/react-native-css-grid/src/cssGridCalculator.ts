import React, { ReactNode, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { parseGridTemplateColumns } from './gridParser';
import { extractGridItemProps } from './gridItemParser';

export interface GridItemData {
  /** Calculated position and size */
  top: number;
  left: number;
  width: number;
  height: number;

  /** Grid positioning info */
  columnStart: number;
  columnEnd: number;
  rowStart: number;
  rowEnd: number;

  /** React component to render */
  component: ReactNode;

  /** Original style for reference */
  originalStyle?: any;

  /** Unique key */
  key: string;
}

export interface GridLayoutResult {
  gridItems: GridItemData[];
  totalWidth: number;
  totalHeight: number;
  columnSizes: number[];
  rowSizes: number[];
  columnCount: number;
  rowCount: number;
}

export interface GridLayoutOptions {
  children: ReactNode;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridTemplateAreas?: string;
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;
  containerWidth: number;
  containerHeight?: number;
  debug?: boolean;
}

/**
 * Calculate CSS Grid layout positions and sizes
 */
export function calculateCSSGridLayout(options: GridLayoutOptions): GridLayoutResult {
  const {
    children,
    gridTemplateColumns = '1fr',
    gridTemplateRows,
    gap = 0,
    rowGap,
    columnGap,
    containerWidth,
    containerHeight,
    debug = false
  } = options;

  // Parse gap values
  const gapValue = typeof gap === 'number' ? gap : parseFloat(String(gap)) || 0;
  const rowGapValue = rowGap !== undefined
    ? (typeof rowGap === 'number' ? rowGap : parseFloat(String(rowGap)) || 0)
    : gapValue;
  const columnGapValue = columnGap !== undefined
    ? (typeof columnGap === 'number' ? columnGap : parseFloat(String(columnGap)) || 0)
    : gapValue;

  // Parse column template
  const columnInfo = parseGridTemplateColumns(gridTemplateColumns, containerWidth);
  const columnSizes = calculateColumnSizes(gridTemplateColumns, containerWidth, columnGapValue);

  // Parse row template (if provided)
  const rowSizes = gridTemplateRows
    ? calculateRowSizes(gridTemplateRows, containerHeight || 0, rowGapValue)
    : [];

  // Extract grid items from children
  const gridItems: GridItemData[] = [];
  let itemIndex = 0;

  React.Children.forEach(children, (child, index) => {
    if (!React.isValidElement(child)) {
      // Handle text nodes and other non-element children
      gridItems.push(createGridItem({
        component: child,
        columnStart: 1,
        columnEnd: 2,
        rowStart: 1,
        rowEnd: 2,
        key: `text-${index}`,
        columnSizes,
        rowSizes,
        columnGapValue,
        rowGapValue,
        debug
      }));
      return;
    }

    const element = child as ReactElement<any>;
    const { gridProps } = extractGridItemProps(element.props.style);

    // Parse grid positioning
    const positioning = parseGridItemPositioning(gridProps, columnInfo.maxColumnRatioUnits);

    // Create clean element without grid properties
    const cleanStyle = element.props.style ? { ...StyleSheet.flatten(element.props.style) } : {};

    // Remove grid-specific properties
    delete cleanStyle.gridColumn;
    delete cleanStyle.gridRow;
    delete cleanStyle.gridArea;
    delete cleanStyle.gridColumnStart;
    delete cleanStyle.gridColumnEnd;
    delete cleanStyle.gridRowStart;
    delete cleanStyle.gridRowEnd;
    delete cleanStyle.justifySelf;
    delete cleanStyle.alignSelf;
    delete cleanStyle.placeSelf;

    const cleanElement = React.cloneElement(element, {
      ...element.props,
      style: Object.keys(cleanStyle).length > 0 ? cleanStyle : undefined
    });

    gridItems.push(createGridItem({
      component: cleanElement,
      columnStart: positioning.columnStart,
      columnEnd: positioning.columnEnd,
      rowStart: positioning.rowStart,
      rowEnd: positioning.rowEnd,
      key: element.key || `item-${itemIndex}`,
      columnSizes,
      rowSizes,
      columnGapValue,
      rowGapValue,
      originalStyle: element.props.style,
      debug
    }));

    itemIndex++;
  });

  // Auto-place items that don't have explicit positioning
  autoPlaceGridItems(gridItems, columnInfo.maxColumnRatioUnits);

  // Calculate total dimensions
  const totalWidth = columnSizes.reduce((sum, size) => sum + size, 0) +
    (columnSizes.length - 1) * columnGapValue;

  const maxRow = Math.max(...gridItems.map(item => item.rowEnd));
  const totalHeight = calculateTotalHeight(maxRow, rowSizes, rowGapValue, gridItems);

  if (debug) {
    console.log('Grid Layout Calculation:', {
      columnSizes,
      rowSizes,
      totalWidth,
      totalHeight,
      gaps: { row: rowGapValue, column: columnGapValue },
      itemCount: gridItems.length
    });
  }

  return {
    gridItems,
    totalWidth,
    totalHeight,
    columnSizes,
    rowSizes,
    columnCount: columnSizes.length,
    rowCount: maxRow
  };
}

/**
 * Calculate column sizes from grid-template-columns
 */
function calculateColumnSizes(
  gridTemplateColumns: string,
  containerWidth: number,
  columnGap: number
): number[] {
  const columnInfo = parseGridTemplateColumns(gridTemplateColumns, containerWidth);

  if (columnInfo.columnSizes.length > 0) {
    // Has explicit pixel sizes
    return columnInfo.columnSizes;
  }

  if (columnInfo.hasFractionalUnits) {
    // Calculate from fractional units
    const availableWidth = containerWidth - (columnInfo.maxColumnRatioUnits - 1) * columnGap;
    const unitSize = availableWidth / columnInfo.totalFr;

    // For now, assume equal distribution - could be enhanced to parse actual fr values
    return new Array(columnInfo.maxColumnRatioUnits).fill(unitSize);
  }

  // Fallback: equal distribution
  const availableWidth = containerWidth - (columnInfo.maxColumnRatioUnits - 1) * columnGap;
  const columnSize = availableWidth / columnInfo.maxColumnRatioUnits;
  return new Array(columnInfo.maxColumnRatioUnits).fill(columnSize);
}

/**
 * Calculate row sizes from grid-template-rows
 */
function calculateRowSizes(
  gridTemplateRows: string,
  containerHeight: number,
  rowGap: number
): number[] {
  // For now, return empty array - row sizing will be auto-calculated
  // This could be enhanced to parse grid-template-rows similar to columns
  return [];
}

/**
 * Parse grid item positioning from CSS Grid properties
 */
function parseGridItemPositioning(
  gridProps: any,
  maxColumns: number
): { columnStart: number; columnEnd: number; rowStart: number; rowEnd: number } {
  let columnStart = 1;
  let columnEnd = 2;
  let rowStart = 1;
  let rowEnd = 2;

  // Parse grid-column
  if (gridProps.gridColumn) {
    const columnSpan = parseGridSpan(gridProps.gridColumn);
    columnEnd = columnStart + columnSpan;
  } else if (gridProps.gridColumnStart && gridProps.gridColumnEnd) {
    columnStart = parseInt(String(gridProps.gridColumnStart), 10) || 1;
    columnEnd = parseInt(String(gridProps.gridColumnEnd), 10) || columnStart + 1;
  }

  // Parse grid-row
  if (gridProps.gridRow) {
    const rowSpan = parseGridSpan(gridProps.gridRow);
    rowEnd = rowStart + rowSpan;
  } else if (gridProps.gridRowStart && gridProps.gridRowEnd) {
    rowStart = parseInt(String(gridProps.gridRowStart), 10) || 1;
    rowEnd = parseInt(String(gridProps.gridRowEnd), 10) || rowStart + 1;
  }

  // Parse grid-area (row-start / column-start / row-end / column-end)
  if (gridProps.gridArea) {
    const areaPositioning = parseGridArea(gridProps.gridArea);
    if (areaPositioning.columnStart > 0) columnStart = areaPositioning.columnStart;
    if (areaPositioning.columnEnd > 0) columnEnd = areaPositioning.columnEnd;
    if (areaPositioning.rowStart > 0) rowStart = areaPositioning.rowStart;
    if (areaPositioning.rowEnd > 0) rowEnd = areaPositioning.rowEnd;
  }

  return { columnStart, columnEnd, rowStart, rowEnd };
}

/**
 * Parse grid span value (e.g., "span 2", "1 / 3", "2")
 */
function parseGridSpan(value: string): number {
  if (!value || typeof value !== 'string') return 1;

  const strValue = value.trim();

  // Handle span syntax: "span 2"
  const spanMatch = strValue.match(/span\s+(\d+)/);
  if (spanMatch) {
    return parseInt(spanMatch[1], 10) || 1;
  }

  // Handle range syntax: "1 / 3"
  if (strValue.includes('/')) {
    const [start, end] = strValue.split('/').map(s => s.trim());
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);
    if (!isNaN(startNum) && !isNaN(endNum)) {
      return Math.max(1, endNum - startNum);
    }
  }

  // Handle single number
  const singleNum = parseInt(strValue, 10);
  if (!isNaN(singleNum)) {
    return Math.max(1, singleNum);
  }

  return 1;
}

/**
 * Parse grid-area value
 */
function parseGridArea(value: string): {
  columnStart: number;
  columnEnd: number;
  rowStart: number;
  rowEnd: number;
} {
  if (!value || typeof value !== 'string') {
    return { columnStart: 0, columnEnd: 0, rowStart: 0, rowEnd: 0 };
  }

  const parts = value.split('/').map(s => s.trim());

  if (parts.length === 4) {
    const [rowStart, colStart, rowEnd, colEnd] = parts;
    return {
      rowStart: parseInt(rowStart, 10) || 0,
      columnStart: parseInt(colStart, 10) || 0,
      rowEnd: parseInt(rowEnd, 10) || 0,
      columnEnd: parseInt(colEnd, 10) || 0
    };
  }

  return { columnStart: 0, columnEnd: 0, rowStart: 0, rowEnd: 0 };
}

/**
 * Create a grid item with calculated position and size
 */
function createGridItem(options: {
  component: ReactNode;
  columnStart: number;
  columnEnd: number;
  rowStart: number;
  rowEnd: number;
  key: string;
  columnSizes: number[];
  rowSizes: number[];
  columnGapValue: number;
  rowGapValue: number;
  originalStyle?: any;
  debug?: boolean;
}): GridItemData {
  const {
    component,
    columnStart,
    columnEnd,
    rowStart,
    rowEnd,
    key,
    columnSizes,
    rowSizes,
    columnGapValue,
    rowGapValue,
    originalStyle,
    debug
  } = options;

  // Calculate position
  const left = columnSizes.slice(0, columnStart - 1).reduce((sum, size) => sum + size, 0) +
    (columnStart - 1) * columnGapValue;

  const top = rowSizes.length > 0
    ? rowSizes.slice(0, rowStart - 1).reduce((sum, size) => sum + size, 0) + (rowStart - 1) * rowGapValue
    : (rowStart - 1) * 100; // Default row height of 100

  // Calculate size
  const width = columnSizes.slice(columnStart - 1, columnEnd - 1).reduce((sum, size) => sum + size, 0) +
    (columnEnd - columnStart - 1) * columnGapValue;

  const height = rowSizes.length > 0
    ? rowSizes.slice(rowStart - 1, rowEnd - 1).reduce((sum, size) => sum + size, 0) + (rowEnd - rowStart - 1) * rowGapValue
    : (rowEnd - rowStart) * 100; // Default row height of 100

  if (debug) {
    console.log(`Grid Item ${key}:`, {
      position: { columnStart, columnEnd, rowStart, rowEnd },
      calculated: { left, top, width, height }
    });
  }

  return {
    top,
    left,
    width,
    height,
    columnStart,
    columnEnd,
    rowStart,
    rowEnd,
    component,
    originalStyle,
    key: String(key)
  };
}

/**
 * Auto-place grid items that don't have explicit positioning
 */
function autoPlaceGridItems(gridItems: GridItemData[], maxColumns: number): void {
  // For now, this is a simple implementation
  // Could be enhanced to implement proper CSS Grid auto-placement algorithm

  const explicitItems = gridItems.filter(item =>
    item.columnStart !== 1 || item.columnEnd !== 2 || item.rowStart !== 1 || item.rowEnd !== 2
  );

  const autoItems = gridItems.filter(item =>
    item.columnStart === 1 && item.columnEnd === 2 && item.rowStart === 1 && item.rowEnd === 2
  );

  // Simple auto-placement: place items in order
  let currentRow = 1;
  let currentColumn = 1;

  for (const item of autoItems) {
    // Find next available position
    while (isPositionOccupied(currentColumn, currentRow, explicitItems)) {
      currentColumn++;
      if (currentColumn > maxColumns) {
        currentColumn = 1;
        currentRow++;
      }
    }

    item.columnStart = currentColumn;
    item.columnEnd = currentColumn + 1;
    item.rowStart = currentRow;
    item.rowEnd = currentRow + 1;

    // Recalculate position and size
    // This would need to be updated with proper column/row sizes

    currentColumn++;
    if (currentColumn > maxColumns) {
      currentColumn = 1;
      currentRow++;
    }
  }
}

/**
 * Check if a grid position is occupied
 */
function isPositionOccupied(column: number, row: number, items: GridItemData[]): boolean {
  return items.some(item =>
    column >= item.columnStart &&
    column < item.columnEnd &&
    row >= item.rowStart &&
    row < item.rowEnd
  );
}

/**
 * Calculate total height based on grid items
 */
function calculateTotalHeight(
  maxRow: number,
  rowSizes: number[],
  rowGap: number,
  gridItems: GridItemData[]
): number {
  if (rowSizes.length > 0) {
    return rowSizes.reduce((sum, size) => sum + size, 0) + (rowSizes.length - 1) * rowGap;
  }

  // Auto-calculate based on items
  return maxRow * 100 + (maxRow - 1) * rowGap; // Default row height of 100
}
