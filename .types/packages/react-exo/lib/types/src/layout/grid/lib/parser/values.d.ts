import { GridViewColumnInfo } from '../../Grid.types';
/**
 * Parses the Grid CSS span value syntax
 * @example
 * ```tsx
 * 'span 2' // 2
 * '1 / 3' // 2
 * '2' // 2
 * ```
 */
export declare function span(input: string): number;
/**
 * Parse grid-area value (row-start / column-start / row-end / column-end)
 */
export declare function area(value: string): {
    widthRatio: number;
    heightRatio: number;
};
/**
 * Parse grid column/row start and end values
 */
export declare function startEnd(start: string | number, end: string | number): number;
export declare function templateColumns(tpl: string): GridViewColumnInfo;
