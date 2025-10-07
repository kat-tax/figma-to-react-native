import { GridViewItemData, GridViewColumnInfo, GridViewGaps, GridViewPosition } from '../../Grid.types';
/**
 * Calculate column sizes from grid-template-columns
 */
export declare function cols(templateColumns: string, containerWidth: number, columnGap: number): number[];
/**
 * Calculate row sizes from grid-template-rows
 */
export declare function rows(_gridTemplateRows: string, _containerHeight: number, _rowGap: number): number[];
/**
 * Parse gap values from CSS Grid gap properties
 */
export declare function gaps(gap?: string | number, rowGap?: string | number, columnGap?: string | number): GridViewGaps;
/**
 * Calculate total height based on grid items
 */
export declare function height(maxRow: number, rowSizes: number[], rowGap: number, _gridItems: GridViewItemData[]): number;
/**
 * Calculate total width based on column sizes
 */
export declare function width(columnSizes: number[], columnGap: number): number;
/**
 * Calculate optimal itemSizeUnit based on grid configuration
 */
export declare function unitSize(templateColumns: string, containerWidth?: number, columnInfo?: GridViewColumnInfo): number;
/**
 * Parse grid-area value for positioning
 */
export declare function position(value: string): GridViewPosition;
