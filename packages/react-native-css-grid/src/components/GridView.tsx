import {useMemo, useState, useCallback} from 'react';
import {ScrollView, View, StyleSheet, LayoutChangeEvent} from 'react-native';
import {calculateLayout} from 'parser/cssGridCalculator';

import type {GridViewProps, GridLayoutResult} from 'types';

/**
 * A grid layout component based on CSS Grid.
 *
 * @example
 * ```tsx
 * <GridView style={{ gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
 *   <GridViewItem style={{ gridColumn: 'span 2' }}>
 *     <Text>Item 1</Text>
 *   </GridViewItem>
 *   <GridViewItem>
 *     <Text>Item 2</Text>
 *   </GridViewItem>
 * </GridView>
 * ```
 */
export function GridView({children, ...props}: GridViewProps) {
  const [size, setSize] = useState(props.initialSize ?? {width: 0, height: 0});
  const layout = useMemo((): GridLayoutResult => {
    if (!size.width || !size.height) return EMPTY_LAYOUT;
    const style = StyleSheet.flatten(props.style);
    return calculateLayout(children, {
      gap: style.gap,
      rowGap: style.rowGap,
      columnGap: style.columnGap,
      containerWidth: size.width,
      containerHeight: size.height,
      gridTemplateRows: style.gridTemplateRows,
      gridTemplateAreas: style.gridTemplateAreas,
      gridTemplateColumns: style.gridTemplateColumns || style.gridTemplate || '1fr',
    });
  }, [children, props.style, size]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setSize({width, height});
    props.onLayout?.(event);
  }, [props.onLayout]);

  return (
    <View onLayout={handleLayout}>
      <ScrollView {...props}>
        <View
          style={{
            position: 'relative',
            width: layout.width,
            height: layout.height,
          }}>
          {layout.items.map(item => (
            <View
              key={item.key}
              style={{
                position: 'absolute',
                top: item.top,
                left: item.left,
                width: item.width,
                height: item.height,
              }}>
              {item.component}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const EMPTY_LAYOUT: GridLayoutResult = {
  items: [],
  width: 0,
  height: 0,
  rowCount: 0,
  rowSizes: [],
  colCount: 0,
  colSizes: [],
}
