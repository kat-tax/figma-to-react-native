import React, { ReactNode, ReactElement } from 'react';
import { StyleSheet } from 'react-native';

export interface GridItemStyle {
  gridColumn?: string;
  gridRow?: string;
  gridArea?: string;
  gridColumnStart?: string | number;
  gridColumnEnd?: string | number;
  gridRowStart?: string | number;
  gridRowEnd?: string | number;
  justifySelf?: string;
  alignSelf?: string;
  placeSelf?: string;
  [key: string]: any;
}

export interface GridItemData {
  /** Ratio determining the width of the item relative to itemSizeUnit. */
  widthRatio?: number;
  /** Ratio determining the height of the item relative to itemSizeUnit. */
  heightRatio?: number;
  component: ReactNode;
  originalStyle?: any;
  [key: string]: any;
}

export interface GridContext {
  maxColumnRatioUnits: number;
  itemSizeUnit: number;
  debug?: boolean;
}

/**
 * Extract grid item properties from a style object
 */
export function extractGridItemProps(style: any): {
  widthRatio: number;
  heightRatio: number;
  gridProps: GridItemStyle;
} {
  const flatStyle = StyleSheet.flatten(style) || {};

  let widthRatio = 1;
  let heightRatio = 1;

  // Parse grid-column
  if (flatStyle.gridColumn) {
    widthRatio = parseGridSpan(flatStyle.gridColumn);
  } else if (flatStyle.gridColumnStart && flatStyle.gridColumnEnd) {
    const start = parseInt(String(flatStyle.gridColumnStart), 10);
    const end = parseInt(String(flatStyle.gridColumnEnd), 10);
    if (!isNaN(start) && !isNaN(end)) {
      widthRatio = Math.max(1, end - start);
    }
  }

  // Parse grid-row
  if (flatStyle.gridRow) {
    heightRatio = parseGridSpan(flatStyle.gridRow);
  } else if (flatStyle.gridRowStart && flatStyle.gridRowEnd) {
    const start = parseInt(String(flatStyle.gridRowStart), 10);
    const end = parseInt(String(flatStyle.gridRowEnd), 10);
    if (!isNaN(start) && !isNaN(end)) {
      heightRatio = Math.max(1, end - start);
    }
  }

  // Parse grid-area (row-start / column-start / row-end / column-end)
  if (flatStyle.gridArea) {
    const areaRatios = parseGridArea(flatStyle.gridArea);
    if (areaRatios.widthRatio > 0) widthRatio = areaRatios.widthRatio;
    if (areaRatios.heightRatio > 0) heightRatio = areaRatios.heightRatio;
  }

  return {
    widthRatio,
    heightRatio,
    gridProps: {
      gridColumn: flatStyle.gridColumn,
      gridRow: flatStyle.gridRow,
      gridArea: flatStyle.gridArea,
      gridColumnStart: flatStyle.gridColumnStart,
      gridColumnEnd: flatStyle.gridColumnEnd,
      gridRowStart: flatStyle.gridRowStart,
      gridRowEnd: flatStyle.gridRowEnd,
      justifySelf: flatStyle.justifySelf,
      alignSelf: flatStyle.alignSelf,
      placeSelf: flatStyle.placeSelf
    }
  };
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
 * Parse grid-area value (row-start / column-start / row-end / column-end)
 */
function parseGridArea(value: string): { widthRatio: number; heightRatio: number } {
  if (!value || typeof value !== 'string') {
    return { widthRatio: 1, heightRatio: 1 };
  }

  const parts = value.split('/').map(s => s.trim());

  if (parts.length === 4) {
    const [rowStart, colStart, rowEnd, colEnd] = parts;

    const rowStartNum = parseInt(rowStart, 10);
    const colStartNum = parseInt(colStart, 10);
    const rowEndNum = parseInt(rowEnd, 10);
    const colEndNum = parseInt(colEnd, 10);

    const widthRatio = (!isNaN(colStartNum) && !isNaN(colEndNum))
      ? Math.max(1, colEndNum - colStartNum)
      : 1;

    const heightRatio = (!isNaN(rowStartNum) && !isNaN(rowEndNum))
      ? Math.max(1, rowEndNum - rowStartNum)
      : 1;

    return { widthRatio, heightRatio };
  }

  // If not 4 parts, treat as named area (default to 1x1)
  return { widthRatio: 1, heightRatio: 1 };
}

/**
 * Create FlexGrid data from React children
 */
export function createGridItemData(
  children: ReactNode,
  context: GridContext
): GridItemData[] {
  const items: GridItemData[] = [];

  React.Children.forEach(children, (child, index) => {
    if (!React.isValidElement(child)) {
      // Handle text nodes and other non-element children
      items.push({
        widthRatio: 1,
        heightRatio: 1,
        component: child,
        originalStyle: null
      });
      return;
    }

    const element = child as ReactElement<any>;
    const { widthRatio, heightRatio, gridProps } = extractGridItemProps(element.props.style);

    if (context.debug) {
      console.log(`Grid Item ${index}:`, {
        widthRatio,
        heightRatio,
        gridProps,
        hasStyle: !!element.props.style
      });
    }

    // Create clean style without grid properties for the wrapped component
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

    // Clone the element with clean style
    const cleanElement = React.cloneElement(element, {
      ...element.props,
      style: Object.keys(cleanStyle).length > 0 ? cleanStyle : undefined
    });

    items.push({
      widthRatio,
      heightRatio,
      component: cleanElement,
      originalStyle: element.props.style
    });
  });

  return items;
}
