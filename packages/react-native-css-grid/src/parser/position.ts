import * as utils from 'utils';
import * as values from 'parser/values';
import type {GridViewItemStyle, GridPosition} from 'types';

/**
 * Parse grid-area value for positioning
 */
export function area(value: string): GridPosition {
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

/**
 * Parse grid item positioning from CSS Grid properties
 */
export function item(
  gridProps: GridViewItemStyle,
  maxColumns: number,
): GridPosition {
  let columnStart = 1;
  let columnEnd = 2;
  let rowStart = 1;
  let rowEnd = 2;
  // Parse grid-column
  if (gridProps.gridColumn) {
    const columnSpan = values.span(gridProps.gridColumn);
    columnEnd = columnStart + columnSpan;
  } else if (gridProps.gridColumnStart && gridProps.gridColumnEnd) {
    columnStart = utils.toInt(gridProps.gridColumnStart, 1);
    columnEnd = utils.toInt(gridProps.gridColumnEnd, columnStart + 1);
  }
  // Parse grid-row
  if (gridProps.gridRow) {
    const rowSpan = values.span(gridProps.gridRow);
    rowEnd = rowStart + rowSpan;
  } else if (gridProps.gridRowStart && gridProps.gridRowEnd) {
    rowStart = utils.toInt(gridProps.gridRowStart, 1);
    rowEnd = utils.toInt(gridProps.gridRowEnd, rowStart + 1);
  }
  // Parse grid-area (row-start / column-start / row-end / column-end)
  if (gridProps.gridArea) {
    const areaPositioning = area(gridProps.gridArea);
    if (areaPositioning.columnStart > 0) columnStart = areaPositioning.columnStart;
    if (areaPositioning.columnEnd > 0) columnEnd = areaPositioning.columnEnd;
    if (areaPositioning.rowStart > 0) rowStart = areaPositioning.rowStart;
    if (areaPositioning.rowEnd > 0) rowEnd = areaPositioning.rowEnd;
  }
  return {
    columnStart,
    columnEnd,
    rowStart,
    rowEnd,
  };
}
