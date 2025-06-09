import CodeBlockWriter from 'code-block-writer';
import {VARIABLE_COLLECTIONS} from 'config/consts';
import {getVariables, getVariableCollection} from 'backend/parser/lib';

import {writePropsAttrs} from './writePropsAttrs';

import type {ComponentInfo} from 'types/component';
import type {ProjectSettings} from 'types/settings';

export async function generateDocs(
  component: ComponentInfo,
  settings: ProjectSettings,
  infoDb: Record<string, ComponentInfo> | null,
) {
  const writer = new CodeBlockWriter(settings?.writer);
  const pkgName = await getDesignProject();
  const attrs = writePropsAttrs(new CodeBlockWriter(settings?.writer), {
    props: component.propDefs,
    infoDb,
  });

  // Imports
  const regex = /(?<=<)([A-Z][a-zA-Z0-9]*)/g;
  const matches = attrs.match(regex);
  const hasIcon = matches?.includes('Icon');
  const imports = Array.from(new Set(matches))
    .sort((a, b) => a?.localeCompare(b))
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
    const config = await getVariableCollection(VARIABLE_COLLECTIONS.APP_CONFIG);
    if (config) {
      const variables = await getVariables(config.variableIds);
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
