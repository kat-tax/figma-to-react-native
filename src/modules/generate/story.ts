import CodeBlockWriter from 'code-block-writer';

import type {ParsedComponent} from 'types/parse';
import type {Settings} from 'types/settings';

export function generateStory(root: ParsedComponent, settings: Settings) {
  const writer = new CodeBlockWriter(settings.output?.format);

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
    writer.quote(root.node.name);
    writer.write(',');
    writer.newLine();
    writer.writeLine('component: Component,');
  });
  writer.write(';');
  writer.blankLine();

  // Story
  // TODO: story for each variant
  writer.write(`export const ${root.name}: Story = `).inlineBlock(() => {
    writer.write('args: ').inlineBlock(() => {
      writer.writeLine(`label: 'Test',`);
      writer.writeLine(`backgroundColor: '#ff0',`);
    });
    writer.write(',');
  });
  writer.write(';');
  writer.blankLine();

  // Default export
  writer.writeLine('export default meta;');

  return writer.toString();
}
