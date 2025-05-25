import React, { useMemo, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { View, ScrollView, LayoutChangeEvent, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

import { parseGridTemplateColumns, calculateItemSizeUnit } from './gridParser';
import { extractGridItemProps, createGridItemData } from './gridItemParser';
import { calculateCSSGridLayout } from './cssGridCalculator';
import { useThrottle } from './hooks/useThrottle';

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

  /** Optional container height override for calculations */
  containerHeight?: number;

  /** Callback when layout changes */
  onLayout?: (event: LayoutChangeEvent) => void;

  /** Enable debug logging */
  debug?: boolean;

  /** Enable virtualization for performance (default: false for CSS Grid compatibility) */
  virtualization?: boolean;

  /** Virtualization buffer factor */
  virtualizedBufferFactor?: number;

  /** Scroll event throttle interval */
  scrollEventInterval?: number;

  /** Show scroll indicators */
  showScrollIndicator?: boolean;

  /** Enable horizontal scrolling */
  horizontalScrollEnabled?: boolean;

  /** Enable vertical scrolling */
  verticalScrollEnabled?: boolean;
}

export interface GridItemProps {
  /** CSS Grid item styles */
  style?: StyleProp<GridItemStyle>;

  /** Child content */
  children: ReactNode;

  /** Optional key for the grid item */
  key?: string | number;
}

export interface GridItemData {
  /** Calculated position and size */
  top: number;
  left: number;
  width: number;
  height: number;

  /** Grid positioning info */
  columnStart: number;
  columnEnd: number;
  rowStart: number;
  rowEnd: number;

  /** React component to render */
  component: ReactNode;

  /** Original style for reference */
  originalStyle?: any;

  /** Unique key */
  key: string;
}

export interface GridLayoutResult {
  gridItems: GridItemData[];
  totalWidth: number;
  totalHeight: number;
  columnSizes: number[];
  rowSizes: number[];
  columnCount: number;
  rowCount: number;
}

/**
 * CSS Grid component for React Native
 *
 * A purpose-built CSS Grid implementation that accepts CSS Grid properties
 * and renders them natively in React Native with proper layout calculations.
 *
 * @example
 * ```tsx
 * <CSSGrid style={{ gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
 *   <GridItem style={{ gridColumn: 'span 2' }}>
 *     <Text>Item 1</Text>
 *   </GridItem>
 *   <GridItem>
 *     <Text>Item 2</Text>
 *   </GridItem>
 * </CSSGrid>
 * ```
 */
export const CSSGrid: React.FC<GridProps> = ({
  style,
  children,
  containerWidth: propContainerWidth,
  containerHeight: propContainerHeight,
  onLayout,
  debug = false,
  virtualization = false,
  virtualizedBufferFactor = 2,
  scrollEventInterval = 200,
  showScrollIndicator = true,
  horizontalScrollEnabled = true,
  verticalScrollEnabled = true
}) => {
  const [containerSize, setContainerSize] = useState({
    width: propContainerWidth || 0,
    height: propContainerHeight || 0
  });
  const [visibleItems, setVisibleItems] = useState<GridItemData[]>([]);
  const scrollPosition = useRef({ x: 0, y: 0 });

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
    onLayout?.(event);
  }, [onLayout]);

  const gridLayout = useMemo((): GridLayoutResult => {
    const flatStyle = StyleSheet.flatten(style) as CSSGridStyle;

    if (!flatStyle || (!propContainerWidth && containerSize.width === 0)) {
      return {
        gridItems: [],
        totalWidth: 0,
        totalHeight: 0,
        columnSizes: [],
        rowSizes: [],
        columnCount: 0,
        rowCount: 0
      };
    }

    const containerWidth = propContainerWidth || containerSize.width;
    const containerHeight = propContainerHeight || containerSize.height;

    // Parse CSS Grid properties
    const columnInfo = parseGridTemplateColumns(
      flatStyle.gridTemplateColumns || flatStyle.gridTemplate || '1fr',
      containerWidth
    );

    // Calculate layout
    const layout = calculateCSSGridLayout({
      children,
      gridTemplateColumns: flatStyle.gridTemplateColumns || flatStyle.gridTemplate || '1fr',
      gridTemplateRows: flatStyle.gridTemplateRows,
      gridTemplateAreas: flatStyle.gridTemplateAreas,
      gap: flatStyle.gap,
      rowGap: flatStyle.rowGap,
      columnGap: flatStyle.columnGap,
      containerWidth,
      containerHeight,
      debug
    });

    if (debug) {
      console.log('CSS Grid Layout:', {
        containerSize: { width: containerWidth, height: containerHeight },
        columnInfo,
        layout: {
          totalWidth: layout.totalWidth,
          totalHeight: layout.totalHeight,
          itemCount: layout.gridItems.length,
          columnCount: layout.columnCount,
          rowCount: layout.rowCount
        }
      });
    }

    return layout;
  }, [style, children, containerSize, propContainerWidth, propContainerHeight, debug]);

  const updateVisibleItems = useCallback(() => {
    if (!virtualization) return;

    const bufferX = containerSize.width * virtualizedBufferFactor;
    const bufferY = containerSize.height * virtualizedBufferFactor;

    const visibleStartX = Math.max(0, scrollPosition.current.x - bufferX);
    const visibleEndX = scrollPosition.current.x + containerSize.width + bufferX;
    const visibleStartY = Math.max(0, scrollPosition.current.y - bufferY);
    const visibleEndY = scrollPosition.current.y + containerSize.height + bufferY;

    const vItems = gridLayout.gridItems.filter((item) => {
      const itemRight = item.left + item.width;
      const itemBottom = item.top + item.height;
      return (
        item.left < visibleEndX &&
        itemRight > visibleStartX &&
        item.top < visibleEndY &&
        itemBottom > visibleStartY
      );
    });

    setVisibleItems(vItems);
  }, [virtualization, containerSize, virtualizedBufferFactor, gridLayout.gridItems]);

  const throttledUpdateVisibleItems = useThrottle(
    updateVisibleItems,
    scrollEventInterval
  );

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    scrollPosition.current = { x: contentOffset.x, y: contentOffset.y };

    if (virtualization) {
      throttledUpdateVisibleItems();
    }
  }, [virtualization, throttledUpdateVisibleItems]);

  useEffect(() => {
    if (virtualization) {
      updateVisibleItems();
    }
  }, [virtualization, updateVisibleItems, gridLayout]);

  const renderedItems = virtualization ? visibleItems : gridLayout.gridItems;

  // If no container width, render as regular View
  if (!propContainerWidth && containerSize.width === 0) {
    return (
      <View style={style as StyleProp<ViewStyle>} onLayout={handleLayout}>
        {children}
      </View>
    );
  }

  // Clean style for container (remove grid-specific properties)
  const flatStyle = StyleSheet.flatten(style) as any;
  const containerStyle: ViewStyle = {};

  // Copy only valid ViewStyle properties
  if (flatStyle) {
    Object.keys(flatStyle).forEach(key => {
      // Skip grid-specific properties
      if (!key.startsWith('grid') &&
          key !== 'gap' &&
          key !== 'rowGap' &&
          key !== 'columnGap' &&
          key !== 'justifyItems' &&
          key !== 'placeItems' &&
          key !== 'placeContent') {
        (containerStyle as any)[key] = flatStyle[key];
      }
    });
  }

  const needsScrolling =
    (horizontalScrollEnabled && gridLayout.totalWidth > containerSize.width) ||
    (verticalScrollEnabled && gridLayout.totalHeight > containerSize.height);

  if (needsScrolling) {
    return (
      <View style={containerStyle} onLayout={handleLayout}>
        <ScrollView
          horizontal={horizontalScrollEnabled && gridLayout.totalWidth > containerSize.width}
          onScroll={handleScroll}
          scrollEventThrottle={32}
          showsHorizontalScrollIndicator={showScrollIndicator}
          showsVerticalScrollIndicator={showScrollIndicator}
          contentContainerStyle={{
            width: gridLayout.totalWidth,
            height: gridLayout.totalHeight,
          }}
        >
          <View
            style={{
              position: 'relative',
              width: gridLayout.totalWidth,
              height: gridLayout.totalHeight,
            }}
          >
            {renderedItems.map((item) => (
              <View
                key={item.key}
                style={{
                  position: 'absolute',
                  top: item.top,
                  left: item.left,
                  width: item.width,
                  height: item.height,
                }}
              >
                {item.component}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={containerStyle} onLayout={handleLayout}>
      <View
        style={{
          position: 'relative',
          width: gridLayout.totalWidth,
          height: gridLayout.totalHeight,
        }}
      >
        {renderedItems.map((item) => (
          <View
            key={item.key}
            style={{
              position: 'absolute',
              top: item.top,
              left: item.left,
              width: item.width,
              height: item.height,
            }}
          >
            {item.component}
          </View>
        ))}
      </View>
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
  // GridItem is just a wrapper - the actual grid logic is handled by the CSSGrid component
  // when it processes children
  return (
    <View style={style as StyleProp<ViewStyle>} {...props}>
      {children}
    </View>
  );
};

// Re-export for convenience
export default CSSGrid;
