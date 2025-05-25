/**
 * CSS Grid to React Native FlexGrid Conversion
 *
 * This module converts CSS Grid layouts to React Native using the react-native-flexible-grid library.
 * It provides functions to detect grid layouts from Figma designs and convert them to FlexGrid components.
 *
 * Key CSS Grid Properties Supported:
 * - display: grid -> Triggers FlexGrid usage
 * - grid-template-columns -> Maps to maxColumnRatioUnits (advanced parsing of repeat(), fr units, minmax(), etc.)
 * - grid-template-rows -> Maps to flexGridRows for row count tracking
 * - grid-auto-flow -> Maps to direction and flow behavior (row/column, dense packing)
 * - justify-items -> Maps to item alignment within grid cells
 * - place-items -> Shorthand for align-items and justify-items
 * - gap, grid-gap -> Maps to itemContainerStyle padding for spacing
 * - row-gap, column-gap -> Maps to itemContainerStyle paddingVertical/paddingHorizontal
 *
 * FlexGrid Properties Used:
 * - data: Array of indices for the grid items
 * - maxColumnRatioUnits: Number of columns (derived from grid-template-columns with advanced parsing)
 * - itemSizeUnit: Default to 1 for consistent sizing
 * - direction: Horizontal/vertical flow based on grid-auto-flow
 * - style: Container styling (width, height, flex, etc.)
 * - itemContainerStyle: Individual item spacing and alignment (gap/justify-items conversion)
 * - renderItem: Function that renders each grid item using existing writeChildren logic
 * - removeClippedSubviews: Performance optimization for large grids
 * - initialNumToRender: Performance optimization for initial render
 * - maxToRenderPerBatch: Performance optimization for batch rendering
 * - windowSize: Performance optimization for viewport management
 *
  * Integration:
 * - shouldUseGrid(): Detects if a node should use grid layout
 * - writeGrid(): Main function to write a complete grid
 * - writeGridContainer(): Helper for integration with existing child rendering
 * - maybeWriteAsGrid(): Convenience function to check and write grid if applicable
 *
 * Usage Example in writeChildren:
 * ```typescript
 * // In writeChild function, before writing normal View:
 * if (maybeWriteAsGrid(writer, child.node, child.children, slug, state)) {
 *   return; // Grid was written, skip normal rendering
 * }
 * // Continue with normal View/Text rendering...
 * ```
 *
 * @see https://github.com/iNerdStack/react-native-flexible-grid
 */

import CodeBlockWriter from 'code-block-writer';

import * as parser from 'backend/parser/lib';
import {writeChildren} from './writeChildren';

import type {ParseData, ParseNodeTree, ParseNodeTreeItem} from 'types/parse';
import type {ProjectSettings} from 'types/settings';
import type {ComponentInfo} from 'types/component';
import type {ImportFlags} from './writeImports';

type StylePrefixMapper = (slug: string, isDynamic: boolean) => string;

interface WriteGridOptions {
  flags: ImportFlags,
  data: ParseData,
  infoDb: Record<string, ComponentInfo> | null,
  settings: ProjectSettings,
  getStyleProp: StylePrefixMapper,
  getIconProp: StylePrefixMapper,
}

interface GridProperties {
  columns?: number;
  rows?: string;
  gap?: number;
  autoFlow?: string;
  justifyItems?: string;
  placeItems?: string;
  itemContainerStyle?: Record<string, any>;
  style?: Record<string, any>;
}

export function writeGrid(
  writer: CodeBlockWriter,
  children: ParseNodeTree,
  slug: string,
  options: WriteGridOptions,
) {
  const {flags, data, settings} = options;

  // Mark FlexGrid as needed for imports
  if (!flags.flexGrid) flags.flexGrid = {};
  flags.flexGrid.FlexGrid = true;

  // Get grid properties from the node's styles
  const gridProps = extractGridProperties(data, slug);

  // Convert children to data items for FlexGrid
  const gridData = convertChildrenToGridData(children, data);

  // Write FlexGrid component
  writeFlexGridComponent(writer, gridProps, gridData, options);
}

/**
 * Check if a node should be rendered as a grid based on its styles
 */
export function shouldUseGrid(node: SceneNode, data: ParseData): boolean {
  const styles = data.stylesheet[node.id];
  if (!styles) return false;

  // Primary check: explicit display: grid (this should be sufficient)
  if (styles['display'] === 'grid') {
    return true;
  }

  // Minimal fallback: only if we have explicit grid template columns
  // (in case display: grid wasn't converted properly by css-to-rn)
  if (styles['flexGridColumns'] && styles['flexGridColumns'] !== '0') {
    return true;
  }

  return false;
}

/**
 * Helper function to integrate grid detection with existing writeChildren flow
 * Call this from writeChildren to check if a node should use grid layout
 */
export function maybeWriteAsGrid(
  writer: CodeBlockWriter,
  node: SceneNode,
  children: ParseNodeTree,
  slug: string,
  options: WriteGridOptions,
): boolean {
  if (!shouldUseGrid(node, options.data)) {
    return false;
  }
  writeGrid(writer, children, slug, options);
  return true;
}

function extractGridProperties(
  data: ParseData,
  slug: string
): GridProperties {
  const styles = data.stylesheet[slug];
  const gridProps: GridProperties = {};

  if (!styles) return gridProps;

  // Extract fake React Native grid properties created by css-to-rn

  // flexGridColumns -> maxColumnRatioUnits (from grid-template-columns)
  if (styles['flexGridColumns']) {
    const columns = Number(styles['flexGridColumns']);
    gridProps.columns = (columns > 0 && columns <= 24) ? columns : 12; // Reasonable bounds
  }

  // gap -> itemContainerStyle with padding (already parsed by css-to-rn)
  if (styles['gap']) {
    const gap = Number(styles['gap']) || 0;
    if (gap > 0) {
      gridProps.gap = gap;
      gridProps.itemContainerStyle = {
        padding: gap / 2, // Split gap between items
      };
    }
  }

  // row-gap and column-gap (already parsed by css-to-rn)
  if (styles['row-gap'] || styles['column-gap']) {
    const rowGap = Number(styles['row-gap']) || 0;
    const colGap = Number(styles['column-gap']) || 0;

    if (rowGap > 0 || colGap > 0) {
      gridProps.itemContainerStyle = {
        ...gridProps.itemContainerStyle,
        paddingVertical: rowGap / 2,
        paddingHorizontal: colGap / 2,
      };
    }
  }

  // Additional grid properties from css-to-rn conversion
  // Extract and store for FlexGrid configuration
  if (styles['flexGridAutoFlow']) {
    gridProps.autoFlow = String(styles['flexGridAutoFlow']);
  }

  if (styles['flexGridJustifyItems']) {
    gridProps.justifyItems = String(styles['flexGridJustifyItems']);
  }

  if (styles['flexGridPlaceItems']) {
    gridProps.placeItems = String(styles['flexGridPlaceItems']);
  }

  if (styles['flexGridRows']) {
    gridProps.rows = String(styles['flexGridRows']);
  }

  // Basic styling - inherit width/height if specified
  gridProps.style = {
    flex: 1,
  };

  // Apply any explicit width/height from styles
  if (styles.width) gridProps.style.width = styles.width;
  if (styles.height) gridProps.style.height = styles.height;
  if (styles.minWidth) gridProps.style.minWidth = styles.minWidth;
  if (styles.minHeight) gridProps.style.minHeight = styles.minHeight;
  if (styles.maxWidth) gridProps.style.maxWidth = styles.maxWidth;
  if (styles.maxHeight) gridProps.style.maxHeight = styles.maxHeight;

  return gridProps;
}

function convertChildrenToGridData(
  children: ParseNodeTree,
  data: ParseData
): ParseNodeTree {
  // Simply return the children as-is since we're now using writeChildren directly
  return children;
}

/**
 * Render a grid item using the existing writeChildren logic
 * This creates a proper integration with the child rendering system
 */
function renderGridItem(
  writer: CodeBlockWriter,
  child: ParseNodeTreeItem,
  index: number,
  gridProps: GridProperties,
  options: WriteGridOptions,
): void {
  const {flags, data, infoDb, settings, getStyleProp, getIconProp} = options;

  // Create a WriteChildrenState for this specific grid item
  const state = {
    flags,
    data,
    infoDb,
    settings,
    pressables: undefined, // No pressables in grid items
    getStyleProp,
    getIconProp,
  };

  // Create a wrapper View with grid-specific styling
  writer.write(`<View`);
  writer.indent(() => {
    writer.writeLine(`key="${child.node.id}"`);
    writer.writeLine(`style={{`);
    writer.indent(() => {
      // Apply grid item specific styling
      writer.writeLine(`flex: 1,`);

      // Add justify-items styling if specified
      if (gridProps.justifyItems) {
        const alignMapping: Record<string, string> = {
          'start': 'flex-start',
          'end': 'flex-end',
          'center': 'center',
          'stretch': 'stretch',
          'normal': 'stretch', // CSS Grid default
        };
        const alignValue = alignMapping[gridProps.justifyItems] || 'flex-start';
        writer.writeLine(`alignItems: '${alignValue}',`);
      }
    });
    writer.writeLine(`}}`);
  });
  writer.writeLine(`>`);

  // Use existing writeChildren logic to render the actual child
  writer.indent(() => {
    writeChildren(writer, [child], state);
  });

  writer.writeLine(`</View>`);

  // Mark View as needed for the wrapper
  flags.reactNative.View = true;
}

function writeFlexGridComponent(
  writer: CodeBlockWriter,
  gridProps: GridProperties,
  gridData: Array<ParseNodeTreeItem>,
  options: WriteGridOptions
) {
  const {flags} = options;

  // Start FlexGrid component
  writer.write('<FlexGrid');

  // Write props
  writer.indent(() => {
    // Data prop - use indices for FlexGrid
    writer.writeLine(`data={${JSON.stringify(gridData.map((_, i) => i))}}`);

    // maxColumnRatioUnits (default to 12 or based on detected columns)
    const columns = gridProps.columns || 12;
    writer.writeLine(`maxColumnRatioUnits={${columns}}`);

    // itemSizeUnit (default to 1)
    writer.writeLine(`itemSizeUnit={1}`);

    // Direction based on grid-auto-flow
    if (gridProps.autoFlow) {
      const direction = gridProps.autoFlow.includes('column') ? 'horizontal' : 'vertical';
      writer.writeLine(`direction="${direction}"`);
    }

    // Style props
    if (gridProps.style && Object.keys(gridProps.style).length > 0) {
      flags.reactNative.StyleSheet = true;
      const styleString = JSON.stringify(gridProps.style);
      writer.writeLine(`style={${styleString}}`);
    }

    // Item container style for gap/spacing
    if (gridProps.itemContainerStyle && Object.keys(gridProps.itemContainerStyle).length > 0) {
      flags.reactNative.StyleSheet = true;
      const itemStyleString = JSON.stringify(gridProps.itemContainerStyle);
      writer.writeLine(`itemContainerStyle={${itemStyleString}}`);
    }

    // Performance optimizations
    writer.writeLine(`removeClippedSubviews={true}`);
    writer.writeLine(`initialNumToRender={10}`);
    writer.writeLine(`maxToRenderPerBatch={5}`);
    writer.writeLine(`windowSize={10}`);

    // renderItem function using existing writeChildren logic
    writer.writeLine(`renderItem={({item, index}) => {`);
    writer.indent(() => {
      writer.writeLine(`switch (index) {`);

      // Generate cases for each grid item using writeChildren
      gridData.forEach((child, index) => {
        writer.indent(() => {
          writer.writeLine(`case ${index}:`);
          writer.indent(() => {
            writer.writeLine(`return (`);
            writer.indent(() => {
              // Use the renderGridItem helper to properly render each child
              renderGridItem(writer, child, index, gridProps, options);
            });
            writer.writeLine(`);`);
          });
        });
      });

      writer.indent(() => {
        writer.writeLine(`default:`);
        writer.indent(() => {
          writer.writeLine(`return null;`);
        });
      });

      writer.writeLine(`}`);
    });
    writer.writeLine(`}}`);
  });

  writer.write('/>');

  // Mark necessary imports
  flags.reactNative.StyleSheet = true;
}
