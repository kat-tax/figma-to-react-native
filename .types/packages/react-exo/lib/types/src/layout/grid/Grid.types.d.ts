import { ReactNode } from 'react';
import { ScrollViewProps, ViewProps, ViewStyle, StyleProp, LayoutChangeEvent } from 'react-native';
export interface GridViewProps extends Omit<ScrollViewProps, 'style' | 'children'> {
    /** The style of the grid container */
    style?: StyleProp<GridViewStyle>;
    /** Child components to be laid out in the grid */
    children?: GridViewItemProps[] | GridViewItemProps;
    /** Initial dimensions of the grid (for SSR) */
    initialSize?: {
        width: number;
        height: number;
    };
    /** Callback when layout changes */
    onLayout?: (event: LayoutChangeEvent) => void;
}
export interface GridViewItemProps extends Omit<ViewProps, 'style'> {
    /** The style of a grid item cell */
    style?: StyleProp<GridViewItemStyle>;
}
export interface GridViewStyle extends ViewStyle {
    grid?: string;
    gridTemplate?: string;
    gridTemplateRows?: string;
    gridTemplateColumns?: string;
    gridTemplateAreas?: string;
    gridAutoFlow?: string;
    gridAutoRows?: string;
    gridAutoColumns?: string;
}
export interface GridViewItemStyle extends ViewStyle {
    gridRow?: string;
    gridRowStart?: string | number;
    gridRowEnd?: string | number;
    gridColumn?: string;
    gridColumnStart?: string | number;
    gridColumnEnd?: string | number;
    gridArea?: string;
}
export interface GridViewLayoutOptions {
    gridTemplateColumns?: string;
    gridTemplateRows?: string;
    gridTemplateAreas?: string;
    gap?: string | number;
    gapValues?: GridViewGaps;
    rowGap?: string | number;
    columnGap?: string | number;
    containerWidth: number;
    containerHeight?: number;
}
export type GridViewLayoutResult = {
    items: GridViewItemData[];
    width: number;
    height: number;
    colCount: number;
    colSizes: number[];
    rowCount: number;
    rowSizes: number[];
};
export type GridViewColumnInfo = {
    maxColumnRatioUnits: number;
    columnSizes: number[];
    hasExplicitSizes: boolean;
    hasFractionalUnits: boolean;
    totalFr: number;
};
export type GridViewColumnPattern = {
    count: number;
    sizes: number[];
    fr: number;
};
export interface GridViewItemOptions {
    rowSizes: number[];
    rowStart: number;
    rowEnd: number;
    columnSizes: number[];
    columnStart: number;
    columnEnd: number;
    gapValues: GridViewGaps;
}
export type GridViewItemData = {
    id: string;
    top: number;
    left: number;
    width: number;
    height: number;
    options: GridViewItemOptions;
    component: ReactNode;
};
export type GridViewPosition = {
    columnStart: number;
    columnEnd: number;
    rowStart: number;
    rowEnd: number;
};
export type GridViewGaps = {
    row: number;
    col: number;
};
