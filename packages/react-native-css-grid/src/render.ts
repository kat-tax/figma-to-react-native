import {isValidElement, cloneElement, Children} from 'react';

import * as area from 'parser/area';
import * as item from 'parser/items';
import * as values from 'parser/values';

import type {
  GridViewProps,
  GridViewItemProps,
  GridLayoutOptions,
  GridLayoutResult,
  GridItemData,
  GridGaps,
} from 'types';

/**
 * Calculate CSS Grid layout positions and sizes
 */
export function layout (
  children: GridViewProps['children'],
  options: GridLayoutOptions,
): GridLayoutResult {
  const {
    gridTemplateColumns = '1fr',
    gridTemplateRows,
    gap = 0,
    rowGap,
    columnGap,
    containerWidth,
    containerHeight,
  } = options;

  // Parse values
  const gaps = area.gaps(gap, rowGap, columnGap);
  const info = values.templateColumns(gridTemplateColumns);
  const rowSizes = gridTemplateRows ? area.rows(gridTemplateRows, containerHeight || 0, gaps.row) : [];
  const colSizes = area.cols(gridTemplateColumns, containerWidth, gaps.col);
  const colCount = colSizes.length;

  // Generate grid items
  const items = generate(
    children || [],
    rowSizes,
    colSizes,
    info.maxColumnRatioUnits,
    gaps,
  );

  // Auto-place items without explicit positioning
  item.move(items, info.maxColumnRatioUnits);

  // Calculate dimensions
  const rowCount = Math.max(...items.map(item => item.options.rowEnd));
  const width = area.width(colSizes, gaps.col);
  const height = area.height(rowCount, rowSizes, gaps.row, items);

  // if (debug) {
  //   console.log('Grid Layout Calculation:', {
  //     columnSizes: sizesCol,
  //     rowSizes: sizesRow,
  //     totalWidth,
  //     totalHeight,
  //     gaps: {row: rowGapValue, column: columnGapValue},
  //     itemCount: list.length,
  //   });
  // }

  return {
    items,
    width,
    height,
    colCount,
    colSizes,
    rowCount,
    rowSizes,
  };
}

/**
 * Process children into grid items
 */
export function generate(
  children: GridViewItemProps[] | GridViewItemProps,
  rowSizes: number[],
  columnSizes: number[],
  // TODO: investigate if this is needed
  maxColumns: number,
  gapValues: GridGaps,
): GridItemData[] {
  return Children.map(children, child => {
    if (!isValidElement<GridViewItemProps>(child))return;
    const [props, style] = item.parse(child.props.style);
    const areaPos = area.position(props.gridArea ?? '');
    const itemPos = item.position(props, areaPos);
    const nodeItem = cloneElement<GridViewItemProps>(child, {...props, style});
    return item.create(nodeItem, {...itemPos, gapValues, rowSizes, columnSizes});
  });
}
