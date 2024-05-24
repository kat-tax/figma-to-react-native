import CodeBlockWriter from 'code-block-writer';
import {getPropsJSX} from 'backend/parser/lib';
import {writePropImports} from './writePropImports';

import type {ProjectSettings} from 'types/settings';
import type {ComponentInfo} from 'types/component';

export function generateDocs(component: ComponentInfo, settings: ProjectSettings) {
  const writer = new CodeBlockWriter(settings?.writer);

  // Imports
  writer.writeLine(':::imports');
  writer.blankLine();
  writePropImports(writer, component.propDefs);
  writer.blankLine();
  writer.writeLine(':::');
  writer.blankLine();

  // Header
  writer.writeLine(':::header:::');
  writer.blankLine();

  // Example
  writer.writeLine(':::demo');
  writer.blankLine();
  writer.writeLine(`<${component.name}${getPropsJSX(component.propDefs)}/>`);
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
