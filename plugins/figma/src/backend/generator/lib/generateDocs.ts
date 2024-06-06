import CodeBlockWriter from 'code-block-writer';
import {writePropsImports} from './writePropsImports';
import {writePropsAttributes} from './writePropsAttributes';

import type {ProjectSettings} from 'types/settings';
import type {ComponentInfo} from 'types/component';

export function generateDocs(component: ComponentInfo, settings: ProjectSettings) {
  const writer = new CodeBlockWriter(settings?.writer);

  // Imports
  const imports = writePropsImports(new CodeBlockWriter(settings?.writer), component.propDefs);
  if (imports) {
    writer.writeLine(':::imports');
    writer.blankLine();
    writer.write(imports);
    writer.blankLine();
    writer.writeLine(':::');
    writer.blankLine();
  }

  // Header
  writer.writeLine(':::header:::');
  writer.blankLine();

  // Example
  writer.writeLine(':::demo');
  writer.blankLine();
  writer.write(`<${component.name}`);
  writer.write(writePropsAttributes(new CodeBlockWriter(settings?.writer), component.propDefs));
  writer.write('/>');
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
