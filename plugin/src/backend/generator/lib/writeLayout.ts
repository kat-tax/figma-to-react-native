import CodeBlockWriter from 'code-block-writer';
import {writeChildren} from './writeChildren';

import type {WriteChildrenState} from './writeChildren';
import type {ParseData, ParseNodeTree} from 'types/parse';

const EXPERIMENTAL_GRID_LAYOUT = false;

/**
 * Writes layout wrappers for root and children components
 */
export function writeLayout(
  writer: CodeBlockWriter,
  nodeId: string,
  children: ParseNodeTree,
  state: WriteChildrenState,
  styleProp?: string,
  additionalProps?: string,
) {
  const hasGrid = hasGridDisplay(nodeId, state.data);
  if (hasGrid) {
    state.flags.exoGrid.GridView = true;
  }

  writer.conditionalWriteLine(hasGrid, `<GridView${styleProp ? ` style={${styleProp}}` : ''}${additionalProps ? ` ${additionalProps}` : ''}>`);
  writer.withIndentationLevel((hasGrid ? 1 : 0) + writer.getIndentationLevel(), () => {
    writeChildren(writer, children, state);
  });
  writer.conditionalWriteLine(hasGrid, `</GridView>`);
}

/**
 * Checks if a node has a grid layout
 */
function hasGridDisplay(nodeId: string, data: ParseData): boolean {
  if (!EXPERIMENTAL_GRID_LAYOUT) return false;
  const styles = data.stylesheet[nodeId];
  return styles?.display === 'grid';
}
