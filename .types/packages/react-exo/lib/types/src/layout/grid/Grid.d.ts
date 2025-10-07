import { GridViewProps, GridViewItemProps } from './Grid.types';
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
export declare function GridView({ children, ...props }: GridViewProps): import("react/jsx-runtime").JSX.Element;
/**
 * A component that represents an individual grid item
 */
export declare function GridViewItem(props: GridViewItemProps): import("react/jsx-runtime").JSX.Element;
