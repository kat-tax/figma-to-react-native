import {StyleSheet} from 'react-native'
import * as values from 'parser/values';
import * as utils from 'utils';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {GridItemData, GridItemOptions, GridPosition, GridViewItemStyle} from 'types';

/**
 * Create a grid item with calculated position and size
 */
export function create(
  component: ReactNode,
  options: GridItemOptions,
): GridItemData {
  const {
    rowSizes,
    rowStart,
    rowEnd,
    columnSizes,
    columnStart,
    columnEnd,
    gapValues,
  } = options;

  // Calculate position
  const left = columnSizes
    .slice(0, columnStart - 1)
    .reduce((sum, size) => sum + size, 0)
      + (columnStart - 1) * gapValues.col;

  const top = rowSizes.length > 0
    ? rowSizes.slice(0, rowStart - 1)
        .reduce((sum, size) => sum + size, 0) +
      (rowStart - 1) * gapValues.row
    : (rowStart - 1) * 100; // Default row height of 100

  // Calculate size
  const width = columnSizes
    .slice(columnStart - 1, columnEnd - 1)
    .reduce((sum, size) => sum + size, 0) +
    (columnEnd - columnStart - 1) * gapValues.col;

  const height = rowSizes.length > 0
    ? rowSizes
        .slice(rowStart - 1, rowEnd - 1)
        .reduce((sum, size) => sum + size, 0) +
      (rowEnd - rowStart - 1) * gapValues.row
    : (rowEnd - rowStart) * 100; // Default row height of 100

  return {
    top,
    left,
    width,
    height,
    options,
    component,
  };
}

/**
 * Auto-place grid items that don't have explicit positioning
 */
export function move(gridItems: GridItemData[], maxColumns: number): void {
  const explicitItems = gridItems.filter(item =>
       item.options.columnStart !== 1
    || item.options.columnEnd !== 2
    || item.options.rowStart !== 1
    || item.options.rowEnd !== 2,
  );

  const autoItems = gridItems.filter(item =>
       item.options.columnStart === 1
    && item.options.columnEnd === 2
    && item.options.rowStart === 1
    && item.options.rowEnd === 2,
  );

  // Simple auto-placement: place items in order
  let currentRow = 1;
  let currentColumn = 1;
  for (const item of autoItems) {
    while (collides(currentColumn, currentRow, explicitItems)) {
      currentColumn++;
      if (currentColumn > maxColumns) {
        currentColumn = 1;
        currentRow++;
      }
    }

    item.options.columnStart = currentColumn;
    item.options.columnEnd = currentColumn + 1;
    item.options.rowStart = currentRow;
    item.options.rowEnd = currentRow + 1;

    currentColumn++;
    if (currentColumn > maxColumns) {
      currentColumn = 1;
      currentRow++;
    }
  }
}

/**
 * Extract grid-specific properties from a style object
 */
export function parse(style: StyleProp<GridViewItemStyle>): [GridViewItemStyle, ViewStyle] {
  const {
    gridArea,
    gridRow,
    gridRowStart,
    gridRowEnd,
    gridColumn,
    gridColumnStart,
    gridColumnEnd,
    ...viewStyles
  } = StyleSheet.flatten(style) ?? {};
  return [{
    gridArea,
    gridRow,
    gridRowStart,
    gridRowEnd,
    gridColumn,
    gridColumnStart,
    gridColumnEnd,
  }, viewStyles];
}

/**
 * Whether a grid position will collide with another item
 */
export function collides(
  col: number,
  row: number,
  items: GridItemData[],
): boolean {
  return items.some(
    item => col >= item.options.columnStart &&
      col < item.options.columnEnd &&
      row >= item.options.rowStart &&
      row < item.options.rowEnd,
  );
}

/**
 * Parse grid item positioning from CSS Grid properties
 */
export function position(
  item: GridViewItemStyle,
  area: GridPosition,
): GridPosition {
  let columnStart = 1;
  let columnEnd = 2;
  let rowStart = 1;
  let rowEnd = 2;
  // Parse grid-column
  if (item.gridColumn) {
    const columnSpan = values.span(item.gridColumn);
    columnEnd = columnStart + columnSpan;
  } else if (item.gridColumnStart && item.gridColumnEnd) {
    columnStart = utils.toInt(item.gridColumnStart, 1);
    columnEnd = utils.toInt(item.gridColumnEnd, columnStart + 1);
  }
  // Parse grid-row
  if (item.gridRow) {
    const rowSpan = values.span(item.gridRow);
    rowEnd = rowStart + rowSpan;
  } else if (item.gridRowStart && item.gridRowEnd) {
    rowStart = utils.toInt(item.gridRowStart, 1);
    rowEnd = utils.toInt(item.gridRowEnd, rowStart + 1);
  }
  // Parse grid-area (row-start / column-start / row-end / column-end)
  if (area.columnStart > 0) columnStart = area.columnStart;
  if (area.columnEnd > 0) columnEnd = area.columnEnd;
  if (area.rowStart > 0) rowStart = area.rowStart;
  if (area.rowEnd > 0) rowEnd = area.rowEnd;
  // Return position
  return {
    columnStart,
    columnEnd,
    rowStart,
    rowEnd,
  };
}
