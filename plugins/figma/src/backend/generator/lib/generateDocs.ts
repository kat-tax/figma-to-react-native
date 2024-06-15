import CodeBlockWriter from 'code-block-writer';
import {writePropsAttributes} from './writePropsAttributes';
import * as consts from 'config/consts';
import * as parser from 'backend/parser/lib';

import type {ProjectSettings} from 'types/settings';
import type {ComponentInfo} from 'types/component';

export async function generateDocs(component: ComponentInfo, settings: ProjectSettings) {
  const writer = new CodeBlockWriter(settings?.writer);
  const pkgName = await getDesignProject();
  const attrs = writePropsAttributes(
    new CodeBlockWriter(settings?.writer),
    component.propDefs,
  );

  // Imports
  const regex = /(?<=<)([A-Z][a-zA-Z0-9]*)/g;
  const matches = attrs.match(regex);
  const hasIcon = matches.includes('Icon');
  const imports = Array.from(new Set(matches))
    .sort((a, b) => a.localeCompare(b))
    .filter(i => i !== 'Icon');
  const identifier = imports.length
    ? `${component.name}, ${imports.join(', ')}`
    : component.name;

  writer.writeLine(':::imports');
  writer.blankLine();
  writer.write(`import {${identifier}} from `);
  writer.quote(pkgName);
  writer.write(';');
  if (hasIcon) {
    writer.newLine();
    writer.write('import {Icon} from ');
    writer.quote('react-exo/icon');
    writer.write(';');
  }
  writer.blankLine();
  writer.writeLine(':::');
  writer.blankLine();

  // Header
  writer.writeLine(':::header:::');
  writer.blankLine();

  // Example
  writer.writeLine(':::demo');
  writer.blankLine();
  writer.write(`<${component.name}`);
  writer.write(attrs);
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

async function getDesignProject() {
  let pkgName = 'design';
  try {
    const config = await parser.getVariableCollection(consts.VARIABLE_COLLECTIONS.APP_CONFIG);
    if (config) {
      const variables = await parser.getVariables(config.variableIds);
      if (variables) {
        const variable = variables.find(v => v.name === 'Design/Package Name');
        if (variable && variable.resolvedType === 'STRING') {
          pkgName = variable.valuesByMode[config.defaultModeId].toString();
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
  return pkgName;
}
