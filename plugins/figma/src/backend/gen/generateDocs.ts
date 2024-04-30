import CodeBlockWriter from 'code-block-writer';
import {sortProps, getPropName} from 'backend/fig/lib';
import {createIdentifierPascal} from 'common/string';

import type {ProjectSettings} from 'types/settings';

export function generateDocs(
  target: ComponentNode,
  isVariant: boolean,
  props: ComponentPropertyDefinitions,
  settings: ProjectSettings,
) {
  const writer = new CodeBlockWriter(settings?.writer);
  const masterNode = isVariant ? target.parent : target;
  const componentName = createIdentifierPascal(masterNode.name);

  // Imports
  writer.writeLine(':::import:::');
  writer.write(`import {Button} from`);
  writer.space();
  writer.quote(`vocs/components`);
  writer.write(';');
  writer.blankLine();

  // Header
  writer.writeLine(`# :::name:::`);
  writer.blankLine();
  writer.writeLine(`> :::desc:::`);
  writer.blankLine();

  // Example
  writer.writeLine(':::example:::');
  writer.blankLine();
  if (Object.keys(props).length > 0) {
    writer.write(`<${componentName}`).indent(() =>
      writeProps(writer, props));
    writer.writeLine(`/>`);
  } else {
    writer.writeLine(`<${componentName}/>`);
  }
  writer.blankLine();
  writer.writeLine(':::');
  writer.blankLine();
  
  // Codeblock
  writer.writeLine('```tsx twoslash');
  writer.writeLine(':::twobase:::');
  writer.writeLine('// @log: ↓ Import the component');
  writer.writeLine(':::import:::');
  writer.blankLine();
  writer.writeLine('// @log: ↓ Try the example');
  writer.writeLine(':::example:::');
  writer.writeLine('```');
  writer.blankLine();

  // Storybook
  writer.writeLine(`<Button href=":::storybook:::">Storybook</Button>`);
  writer.blankLine();

  // Props
  writer.writeLine('## Props');
  writer.blankLine();
  writer.writeLine(':::props:::');

  return writer.toString();
}

function writeProps(writer: CodeBlockWriter, props: ComponentPropertyDefinitions) {
  const componentProps = props ? Object.entries(props) : [];
  componentProps.sort(sortProps).forEach(([key, prop]) => {
    const {type, value, defaultValue}: any = prop;
    const name = getPropName(key);
    const val = value || defaultValue;
    // String or state
    if (type === 'TEXT' || type === 'VARIANT') {
      writer.write(`${name}="${val}"`);
      writer.newLine();
    // Component
    // TODO: generalize instance swap handling
    } else if (type === 'INSTANCE_SWAP') {
      const component = figma.getNodeById(val);
      const tagName = '<' + (createIdentifierPascal(component.name) || 'View') + '/>';
      writer.writeLine(`${name}={${tagName}}`);
    // Number, Boolean, etc.
    } else {
      writer.writeLine(`${name}={${val}}`);
    }
  });
}
