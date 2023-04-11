import CodeBlockWriter from 'code-block-writer';
import {sortProps, getSlug} from 'utils/figma';

import type {ParsedComponent} from 'types/parse';
import type {Settings} from 'types/settings';

export function generateStory(root: ParsedComponent, settings: Settings) {
  const writer = new CodeBlockWriter(settings.output?.format);
  const isVariant = !!root.node?.variantProperties;
  const nodeName = isVariant ? root.node.name : root.name;
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
      writer.write('args: ').inlineBlock(() => {
        if (nodeProps.length > 0) {
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
        }
      });
      writer.write(',');
    });
    writer.write(';');
    writer.blankLine();
  } else {
/*
    writer.write(`export const ${variantName}: Story = `).inlineBlock(() => {
      writer.write('args: ').inlineBlock(() => {
        if (props.length > 0) {
          props.sort(sortProps).forEach(([key, prop]) => {
            const {type, variantOptions}: any = prop;
            const name = getSlug(key.split('#').shift());
            const typing = type === 'VARIANT'
              ? variantOptions.map((v: any) => `'${v}'`).join(' | ')
              : type === 'TEXT'
                ? 'string'
                : type.toLowerCase();
            writer.writeLine(`${name}: ${typing};`);
          });
        }

        // TODO: replace below placeholders with real props
        console.log('PROPS', props)
        writer.writeLine(`label: 'Test',`);
        writer.writeLine(`backgroundColor: '#ff0',`);
      });
      writer.write(',');
    });
    writer.write(';');
    writer.blankLine();
*/
  }

  // Default export
  writer.writeLine('export default meta;');

  return writer.toString();
}
