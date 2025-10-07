import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { GridViewItemData, GridViewItemOptions, GridViewPosition, GridViewItemStyle } from '../../Grid.types';
/**
 * Create a grid item with calculated position and size
 */
export declare function create(component: ReactNode, options: GridViewItemOptions): GridViewItemData;
/**
 * Auto-place grid items that don't have explicit positioning
 */
export declare function move(gridItems: GridViewItemData[], maxColumns: number): void;
/**
 * Extract grid-specific properties from a style object
 */
export declare function parse(style: StyleProp<GridViewItemStyle>): [GridViewItemStyle, ViewStyle];
/**
 * Whether a grid position will collide with another item
 */
export declare function collides(col: number, row: number, items: GridViewItemData[]): boolean;
/**
 * Parse grid item positioning from CSS Grid properties
 */
export declare function position(item: GridViewItemStyle, area: GridViewPosition): GridViewPosition;
