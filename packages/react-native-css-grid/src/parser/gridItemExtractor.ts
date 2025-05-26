/**
 * Grid item property extraction utilities
 */

import { StyleSheet } from 'react-native';
import type { GridItemStyle } from './types';

/**
 * Extract grid item properties from a style object
 */
export function extractGridItemProps(style: any): GridItemStyle {
  const flatStyle = StyleSheet.flatten(style) || {};

  return {
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
  };
}

/**
 * Clean style object by removing grid-specific properties
 */
export function cleanGridPropsFromStyle(style: any): any {
  if (!style) return undefined;

  const cleanStyle = { ...StyleSheet.flatten(style) };

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

  return Object.keys(cleanStyle).length > 0 ? cleanStyle : undefined;
}
