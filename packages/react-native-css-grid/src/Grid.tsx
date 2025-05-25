import React, { useMemo, useState, useCallback, ReactNode } from 'react';
import { View, LayoutChangeEvent, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import FlexGrid from 'react-native-flexible-grid';
import type { FlexGridProps, FlexGridTile } from 'react-native-flexible-grid';

import { parseGridTemplateColumns, calculateItemSizeUnit } from './gridParser';
import { extractGridItemProps, createGridItemData } from './gridItemParser';

export interface CSSGridStyle {
  // Container properties
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridTemplateAreas?: string;
  gridTemplate?: string;
  gridAutoFlow?: string;
  gridAutoColumns?: string;
  gridAutoRows?: string;
  grid?: string;
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;

  // Alignment properties
  justifyItems?: string;
  alignItems?: string;
  placeItems?: string;
  justifyContent?: string;
  alignContent?: string;
  placeContent?: string;

  // Standard style properties
  [key: string]: any;
}

export interface GridItemStyle {
  // Item positioning
  gridColumn?: string;
  gridRow?: string;
  gridArea?: string;
  gridColumnStart?: string | number;
  gridColumnEnd?: string | number;
  gridRowStart?: string | number;
  gridRowEnd?: string | number;

  // Item alignment
  justifySelf?: string;
  alignSelf?: string;
  placeSelf?: string;

  // Standard style properties
  [key: string]: any;
}

export interface GridProps {
  /** CSS Grid container styles */
  style?: StyleProp<CSSGridStyle>;

  /** Child components to be laid out in the grid */
  children: ReactNode;

  /** Optional container width override for calculations */
  containerWidth?: number;

  /** FlexGrid props to override defaults */
  flexGridProps?: Partial<FlexGridProps>;

  /** Callback when layout changes */
  onLayout?: (event: LayoutChangeEvent) => void;

  /** Enable debug logging */
  debug?: boolean;
}

export interface GridItemProps {
  /** CSS Grid item styles */
  style?: StyleProp<GridItemStyle>;

  /** Child content */
  children: ReactNode;

  /** Optional key for the grid item */
  key?: string | number;
}

/**
 * CSS Grid component for React Native
 *
 * Accepts CSS Grid properties and converts them to FlexGrid at runtime.
 * Supports responsive updates when container resizes.
 *
 * @example
 * ```tsx
 * <Grid style={{ gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
 *   <GridItem style={{ gridColumn: 'span 2' }}>
 *     <Text>Item 1</Text>
 *   </GridItem>
 *   <GridItem>
 *     <Text>Item 2</Text>
 *   </GridItem>
 * </Grid>
 * ```
 */
export const Grid: React.FC<GridProps> = ({
  style,
  children,
  containerWidth: propContainerWidth,
  flexGridProps = {},
  onLayout,
  debug = false
}) => {
  const [containerWidth, setContainerWidth] = useState<number>(propContainerWidth || 0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
    onLayout?.(event);
  }, [onLayout]);

  const gridConfig = useMemo(() => {
    const flatStyle = StyleSheet.flatten(style) as CSSGridStyle;

    if (!flatStyle) {
      return {
        maxColumnRatioUnits: 12,
        itemSizeUnit: 50,
        data: [],
        hasGridProperties: false
      };
    }

    // Parse grid template columns
    const columnInfo = parseGridTemplateColumns(
      flatStyle.gridTemplateColumns || flatStyle.gridTemplate || '1fr',
      propContainerWidth || containerWidth
    );

    // Calculate optimal item size unit
    const itemSizeUnit = calculateItemSizeUnit(
      flatStyle.gridTemplateColumns || flatStyle.gridTemplate || '1fr',
      propContainerWidth || containerWidth,
      columnInfo
    );

    // Extract grid items from children
    const gridItemsData = createGridItemData(children, {
      maxColumnRatioUnits: columnInfo.maxColumnRatioUnits,
      itemSizeUnit,
      debug
    });

    if (debug) {
      console.log('Grid Config:', {
        maxColumnRatioUnits: columnInfo.maxColumnRatioUnits,
        itemSizeUnit,
        containerWidth: propContainerWidth || containerWidth,
        itemCount: gridItemsData.length,
        columnInfo
      });
    }

    return {
      maxColumnRatioUnits: columnInfo.maxColumnRatioUnits,
      itemSizeUnit,
      data: gridItemsData,
      hasGridProperties: true,
      gap: flatStyle.gap,
      rowGap: flatStyle.rowGap,
      columnGap: flatStyle.columnGap
    };
  }, [style, children, containerWidth, propContainerWidth, debug]);

  const renderItem = useCallback(({ item }: { item: FlexGridTile & { component: ReactNode } }) => {
    return <>{item.component}</>;
  }, []);

  // If no container width and no grid properties, render as regular View
  if (!gridConfig.hasGridProperties || (!propContainerWidth && containerWidth === 0)) {
    return (
      <View style={style} onLayout={handleLayout}>
        {children}
      </View>
    );
  }

  const flexGridStyle: ViewStyle = {
    ...(StyleSheet.flatten(style) as ViewStyle),
    // Remove grid-specific properties that FlexGrid doesn't understand
    gridTemplateColumns: undefined,
    gridTemplateRows: undefined,
    gridTemplateAreas: undefined,
    gridTemplate: undefined,
    gridAutoFlow: undefined,
    gridAutoColumns: undefined,
    gridAutoRows: undefined,
    grid: undefined,
  };

  return (
    <View style={flexGridStyle} onLayout={handleLayout}>
      <FlexGrid
        maxColumnRatioUnits={gridConfig.maxColumnRatioUnits}
        itemSizeUnit={gridConfig.itemSizeUnit}
        data={gridConfig.data}
        renderItem={renderItem}
        virtualization={false} // Disable for CSS Grid compatibility
        autoAdjustItemWidth={true}
        showScrollIndicator={false}
        {...flexGridProps}
      />
    </View>
  );
};

/**
 * Grid item component for CSS Grid
 *
 * @example
 * ```tsx
 * <GridItem style={{ gridColumn: 'span 2', gridRow: '1 / 3' }}>
 *   <Text>Spans 2 columns and 2 rows</Text>
 * </GridItem>
 * ```
 */
export const GridItem: React.FC<GridItemProps> = ({ style, children, ...props }) => {
  // GridItem is just a wrapper - the actual grid logic is handled by the Grid component
  // when it processes children
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
};

// Re-export for convenience
export default Grid;
