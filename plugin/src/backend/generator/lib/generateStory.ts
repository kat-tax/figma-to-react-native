import CodeBlockWriter from 'code-block-writer';

import * as parser from 'backend/parser/lib';
import * as string from 'common/string';

import {writePropComponent} from './writePropsAttributes';
import {writePropsImports} from './writePropsImports';
import {sortImports} from './writeImports';

import type {ProjectSettings} from 'types/settings';
import type {ComponentInfo} from 'types/component';

export function generateStory(component: ComponentInfo, settings: ProjectSettings, infoDb: Record<string, ComponentInfo>) {
  const writer = new CodeBlockWriter(settings?.writer);

  writeImports(writer, component, infoDb);
  writer.blankLine();
  writeMetaData(writer, component);
  writer.blankLine();
  writeStories(writer, component, infoDb);
  writer.writeLine('export default meta;');

  return writer.toString();
}

function writeImports(writer: CodeBlockWriter, component: ComponentInfo, infoDb: Record<string, ComponentInfo>) {
  // Import Component
  writer.write(`import {${component.name} as Component} from`);
  writer.space();
  writer.quote(component.path);
  writer.write(';');
  writer.newLine();

  // Import Prop Components (if any)
  const iwriter = new CodeBlockWriter(writer.getOptions());
  writePropsImports(iwriter, component.propDefs, infoDb);
  const ival = iwriter.toString();
  if (ival.length > 0) {
    const imports = new Set(ival.split('\n'));
    writer.write(Array
      .from(imports)
      .filter(Boolean)
      .sort(sortImports)
      .join('\n'));
    writer.newLine();
  }

  // Boilerplate
  writer.write('import type {StoryObj, Meta} from');
  writer.space();
  writer.quote('@storybook/react');
  writer.write(';');
  writer.newLine();
  writer.blankLine();
  writer.writeLine('type Story = StoryObj<typeof Component>;');
}

function writeMetaData(writer: CodeBlockWriter, component: ComponentInfo) {
  writer.write('const meta: Meta<typeof Component> = ').inlineBlock(() => {
    writer.write('title:');
    writer.space();
    writer.quote(component.section
      ? `${component.page.name}/${component.section.name}/${component.name}`
      : `${component.page.name}/${component.name}`);
    writer.write(',');
    writer.newLine();
    writer.writeLine('component: Component,');
  });
  writer.write(';');
}

function writeStories(writer: CodeBlockWriter, component: ComponentInfo, infoDb: Record<string, ComponentInfo>) {
  // Single Story
  if (!component.isVariant) {
    writer.write(`export const ${component.name}: Story = `).inlineBlock(() =>
      writeStoryProps(writer, component, infoDb));
    writer.write(';');
    writer.blankLine();

  // Multiple Stories (variants)
  } else {
    let defaultVariant: string;
    component.target.children.forEach(child => {
      const variant = string.createIdentifierPascal(child.name.split(', ').map((n: string) => n.split('=').pop()).join(''));
      writer.write(`export const ${variant}: Story = `).inlineBlock(() => {
        if (!defaultVariant) defaultVariant = variant;
        if (variant === defaultVariant) {
          writeStoryProps(writer, component, infoDb);
        } else {
          writeStoryPropsVariant(writer, (child as VariantMixin), defaultVariant);
        }
      });
      writer.write(';');
      writer.blankLine();
    });
  }
}

function writeStoryProps(writer: CodeBlockWriter, component: ComponentInfo, infoDb: Record<string, ComponentInfo>) {
  const props = component.propDefs ? Object.entries(component.propDefs) : [];
  if (props.length > 0) {
    writer.write('args: ').inlineBlock(() => {
      props.sort(parser.sortComponentPropsDef).forEach(([key, prop]) => {
        const {type, defaultValue} = prop;
        const value = defaultValue.toString();
        const name = parser.getComponentPropName(key);
        // String or state
        if (type === 'TEXT' || type === 'VARIANT') {
          writer.write(`${name}:`);
          writer.space();
          writer.quote(value);
          writer.write(',');
          writer.newLine();
        // Component
        } else if (type === 'INSTANCE_SWAP') {
          const node = parser.getNode(value);
          const swap = parser.getComponentInfo(node, infoDb);
          const isIcon = parser.isNodeIcon(swap.target);
          const tagName = !isIcon ? string.createIdentifierPascal(swap.name) : 'Icon';
          writer.write(`${name}: (`);
          writer.indent(() => {
            writer.write(`<${tagName}`);
            const subwriter = new CodeBlockWriter(writer.getOptions());
            writePropComponent(subwriter, key, name, value, swap.propDefs, infoDb, true, true);
            writer.write(subwriter.toString());
            writer.write('/>');
          });
          writer.write('),');
          writer.newLine();
        // Number or boolean
        } else {
          writer.writeLine(`${name}: ${value},`);
        }
      });
    });
    writer.write(',');
  } else {
    writer.writeLine('// ...');
  }
}

function writeStoryPropsVariant(
  writer: CodeBlockWriter,
  variant: VariantMixin,
  defaultVariant: string,
) {
  const props = Object.entries(variant.variantProperties);
  writer.write('args: ').inlineBlock(() => {
    writer.writeLine(`...${defaultVariant}.args,`);
    if (props.length === 0) return;
    props.forEach(([k, v]) => {
        writer.write(`${k}:`);
        writer.space();
        writer.quote(v);
        writer.write(',');
        writer.newLine();
    });
  });
}
