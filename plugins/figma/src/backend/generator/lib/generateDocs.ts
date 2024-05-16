import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal} from 'common/string';
import {getPropsJSX} from 'backend/parser/lib';
import {writePropImports} from './writePropImports';

import type {ProjectSettings} from 'types/settings';

export function generateDocs(
  target: ComponentNode,
  isVariant: boolean,
  propDefs: ComponentPropertyDefinitions,
  settings: ProjectSettings,
) {
  const writer = new CodeBlockWriter(settings?.writer);
  const masterNode = isVariant ? target.parent : target;
  const componentName = createIdentifierPascal(masterNode.name);

  // Imports
  writer.writeLine(':::imports');
  writer.blankLine();
  writePropImports(writer, propDefs);
  writer.blankLine();
  writer.writeLine(':::');
  writer.blankLine();

  // Header
  writer.writeLine(':::header:::');
  writer.blankLine();

  // Example
  writer.writeLine(':::demo');
  writer.blankLine();
  writer.writeLine(`<${componentName}${getPropsJSX(propDefs)}/>`);
  writer.blankLine();
  writer.writeLine(':::');
  writer.blankLine();
  writer.writeLine(':::usage:::');
  writer.blankLine();
  writer.writeLine(':::storybook:::');
  writer.blankLine();

  // Props
  writer.writeLine('## Props');
  writer.blankLine();
  writer.writeLine(':::props:::');

  return writer.toString();
}
