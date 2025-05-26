import CodeBlockWriter from 'code-block-writer';
import {writeChildren} from './writeChildren';

import type {ParseData, ParseNodeTree} from 'types/parse';
import type {ProjectSettings} from 'types/settings';
import type {ComponentInfo} from 'types/component';
import type {ImportFlags} from './writeImports';

type StylePrefixMapper = (slug: string, isDynamic: boolean) => string;
type WriteGridState = {
  flags: ImportFlags,
  data: ParseData,
  infoDb: Record<string, ComponentInfo> | null,
  settings: ProjectSettings,
  pressables?: string[][],
  getStyleProp: StylePrefixMapper,
  getIconProp: StylePrefixMapper,
}

/**
 * Checks if a node has CSS Grid display property
 */
function hasGridDisplay(nodeId: string, data: ParseData): boolean {
  const styles = data.stylesheet[nodeId];
  return styles?.display === 'grid';
}

/**
 * Writes a GridView wrapper around children if the node has display: grid
 */
export function writeGrid(
  writer: CodeBlockWriter,
  nodeId: string,
  children: ParseNodeTree,
  state: WriteGridState,
  styleProp?: string,
) {
  const hasGrid = hasGridDisplay(nodeId, state.data);

  // Set import flag if grid is used
  if (hasGrid) {
    state.flags.exoGrid.GridView = true;
  }

  // Conditionally write GridView wrapper
  writer.conditionalWriteLine(hasGrid, `<GridView${styleProp ? ` style={${styleProp}}` : ''}>`);
  writer.withIndentationLevel((hasGrid ? 1 : 0) + writer.getIndentationLevel(), () => {
    writeChildren(writer, children, state);
  });
  writer.conditionalWriteLine(hasGrid, `</GridView>`);
}

/**
 * Writes GridView wrapper for root component if it has display: grid
 */
export function writeRootGrid(
  writer: CodeBlockWriter,
  nodeId: string,
  children: ParseNodeTree,
  state: WriteGridState,
  styleProp?: string,
  additionalProps?: string,
) {
  const hasGrid = hasGridDisplay(nodeId, state.data);

  // Set import flag if grid is used
  if (hasGrid) {
    state.flags.exoGrid.GridView = true;
  }

  // Conditionally write GridView wrapper with additional props support
  writer.conditionalWriteLine(hasGrid, `<GridView${styleProp ? ` style={${styleProp}}` : ''}${additionalProps ? ` ${additionalProps}` : ''}>`);
  writer.withIndentationLevel((hasGrid ? 1 : 0) + writer.getIndentationLevel(), () => {
    writeChildren(writer, children, state);
  });
  writer.conditionalWriteLine(hasGrid, `</GridView>`);
}
