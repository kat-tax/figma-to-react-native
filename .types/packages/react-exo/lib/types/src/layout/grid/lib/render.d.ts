import { GridViewProps, GridViewItemProps, GridViewLayoutOptions, GridViewLayoutResult, GridViewItemData, GridViewGaps } from '../Grid.types';
/**
 * Calculate CSS Grid layout positions and sizes
 */
export declare function layout(children: GridViewProps['children'], options: GridViewLayoutOptions): GridViewLayoutResult;
/**
 * Process children into grid items
 */
export declare function generate(children: GridViewItemProps[] | GridViewItemProps, rowSizes: number[], columnSizes: number[], _maxColumns: number, gapValues: GridViewGaps): GridViewItemData[];
