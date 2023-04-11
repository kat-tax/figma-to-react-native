import CodeBlockWriter from 'code-block-writer';
import {sortProps, getSlug, getName} from 'utils/figma';

import type {ParsedComponent} from 'types/parse';
import type {Settings} from 'types/settings';

export function generateStory(root: ParsedComponent, settings: Settings) {
  const writer = new CodeBlockWriter(settings.output?.format);
  const isVariant = !!root.node?.variantProperties;
  const nodeName = isVariant ? root.node.parent.name : root.name;
  const nodeProps = Object.entries(isVariant
    ? root.node?.parent?.componentPropertyDefinitions
    : root.node.componentPropertyDefinitions
  );

  // Import Component
  writer.write(`import {${root.name} as Component} from`);
  writer.space();
  writer.quote(`./${root.name}`);
  writer.write(';');
  writer.newLine();

  // Boilerplate
  writer.write('import type {StoryObj, Meta} from');
  writer.space();
  writer.quote('@storybook/react');
  writer.write(';');
  writer.newLine();
  writer.blankLine();
  writer.writeLine('type Story = StoryObj<typeof Component>;');
  writer.blankLine();

  // Metadata
  writer.write('const meta: Meta<typeof Component> = ').inlineBlock(() => {
    writer.write('title:');
    writer.space();
    writer.quote(nodeName);
    writer.write(',');
    writer.newLine();
    writer.writeLine('component: Component,');
  });
  writer.write(';');
  writer.blankLine();

  // Story
  if (!isVariant) {
    writer.write(`export const ${root.name}: Story = `).inlineBlock(() => {
      if (nodeProps.length > 0) {
        writer.write('args: ').inlineBlock(() => {
          nodeProps.sort(sortProps).forEach(([key, prop]) => {
            const {type, value, defaultValue}: any = prop;
            const name = getSlug(key.split('#').shift());
            writer.write(`${name}:`);
            writer.space();
            if (type === 'TEXT' || type === 'VARIANT') {
              writer.quote(value || defaultValue);
            } else {
              writer.write(value || defaultValue);
            }
            writer.write(',');
            writer.newLine();
          });
        });
      }
      writer.write(',');
    });
    writer.write(';');
    writer.blankLine();
  } else {
    console.log(root.node);
    root.node.parent.children.forEach((child: any) => {
      const name = getName(child.name.split('=').pop());
      console.log(name, nodeProps);
      writer.write(`export const ${name}: Story = `).inlineBlock(() => {
        writer.write('args: ').inlineBlock(() => {
          nodeProps.sort(sortProps).forEach(([key, prop]) => {
            const {type, defaultValue}: any = prop;
            const propName = getSlug(key.split('#').shift());
            if (type === 'VARIANT') {
              writer.write(`${propName}:`);
              writer.space();
              writer.quote(name);
              writer.write(',');
              writer.newLine();
            } else if (type === 'NUMBER' || type === 'BOOLEAN') {
              writer.writeLine(`${propName}: ${defaultValue || ''},`);
            } else {
              writer.write(`${propName}:`);
              writer.space();
              writer.quote(defaultValue);
              writer.write(',');
              writer.newLine();
            }
          });
        });
        writer.write(',');
      });
      writer.write(';');
      writer.blankLine();
    });
  }

  // Default export
  writer.writeLine('export default meta;');

  return writer.toString();
}
