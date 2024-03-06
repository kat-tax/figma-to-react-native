import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal} from 'common/string';

import type {ProjectSettings} from 'types/settings';

const STORYBOOK = 'https://exo.fig.run';

export function generateDocs(
  target: ComponentNode,
  isVariant: boolean,
  props: ComponentPropertyDefinitions,
  settings: ProjectSettings,
) {
  const writer = new CodeBlockWriter(settings?.writer);
  const masterNode = isVariant ? target.parent : target;
  const componentName = createIdentifierPascal(masterNode.name);
  // const storybookPath = `${STORYBOOK}/?path=/docs/components-${componentName.toLowerCase()}`;

  // Import Component
  writer.write(`import {${componentName}} from`);
  writer.space();
  writer.quote(`ui`);
  writer.write(';');
  writer.blankLine();

  // Import Storybook Button
  // writer.write('import {Button as Link} from');
  // writer.space();
  // writer.quote('vocs/components');
  // writer.write(';');
  // writer.blankLine();

  // Title
  writer.writeLine(`# ${componentName} Component`);
  writer.blankLine();

  // Description
  writer.write(`${(masterNode as ComponentNode).description}`);
  writer.blankLine();

  // Usage
  writer.writeLine('```tsx twoslash');
  writer.writeLine("import React from 'react';");
  writer.writeLine('// ---cut---');
  writer.writeLine(`import {${componentName}} from 'ui';`);
  writer.blankLine();
  writer.write(`export default () => (`).indent(() => {
    writer.writeLine(`<${componentName}/> // [!code focus]`);
  });
  writer.writeLine(`);`);
  writer.writeLine('```');

  // Storybook
  // writer.writeLine(`<Link href="${storybookPath}">Storybook</Link>`);

  return writer.toString();
}
