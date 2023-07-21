import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal, createIdentifier} from 'common/string';
import {getPropName, sortProps} from 'modules/fig/lib';
import {writeChildren} from './writeChildren';
import {writeClasses} from './writeClasses';

import type {ParseData} from 'types/figma';
import type {Settings} from 'types/settings';

type StylePrefixMapper = (slug: string) => string;

export function writeFunction(
  writer: CodeBlockWriter,
  data: ParseData,
  settings: Settings,
  stylePrefix: string,
  isPreview?: boolean,
) {
  // Derived data
  const isVariant = !!(data.root.node as SceneNode & VariantMixin).variantProperties;
  const masterNode = (isVariant ? data.root.node?.parent : data.root.node) as ComponentNode;
  const propDefs = (masterNode as ComponentNode)?.componentPropertyDefinitions;
  const props = propDefs ? Object.entries(propDefs) : [];
  const name = createIdentifierPascal(masterNode.name);

  // Store variants
  const variants: Record<string, Set<string>> = {};

  // Component props
  if (props.length > 0) {
    writer.write(`export interface ${name}Props`).block(() => {
      props.sort(sortProps).forEach(([key, prop]) => {
        const {type, variantOptions}: any = prop;
        const propName = getPropName(key);
        const propCond = type === 'BOOLEAN' ? '?' : '';
        const propType: string = type === 'VARIANT'
          ? name+createIdentifierPascal(propName)
          : type === 'INSTANCE_SWAP'
            ? `JSX.Element`
            : type === 'TEXT'
              ? 'string'
              : type.toLowerCase();
        if (type === 'VARIANT') {
          if (!variants[propName]) variants[propName] = new Set();
          variantOptions?.forEach((v: any) =>
            variants[propName].add(createIdentifier(v)));
        }
        writer.writeLine(`${propName}${propCond}: ${propType};`);
      });
    });
    writer.blankLine();
  }

  // Component state enums
  Object.entries(variants).forEach(([key, value]) => {
    const enumId = name+createIdentifierPascal(key);
    writer.write(`export enum ${enumId}`).block(() => {
      value.forEach((value: string, i) => {
        const enumEntry = createIdentifierPascal(value);
        writer.write(`${enumEntry} = `)
        writer.quote(value);
        writer.write(',');
        writer.newLine();
      });
    });
    writer.blankLine();
  });

  // Component documentation
  if (masterNode.description) {
    writer.writeLine(`/**`);
    masterNode.description.split('\n').forEach((line: string) => {
      writer.writeLine(` * ${line.trim()}`);
    });
    if (masterNode?.documentationLinks?.length > 0) {
      writer.writeLine(` * @link ${masterNode.documentationLinks[0].uri}`);
    }
    writer.writeLine(` */`);
  }

  // Determine if style is conditional or static
  const getStylePrefix: StylePrefixMapper = (slug) =>
    Object.keys(data.variants).includes(slug)
      ? 'classes' : stylePrefix;

  // Component function body and children
  const attrProps = `${props.length > 0 ? `props: ${name}Props` : ''}`;
  writer.write(`export function ${name}(${attrProps})`).block(() => {
    if (isVariant && Object.keys(data.variants).length > 0)
      writeClasses(writer, data, name, stylePrefix);
    writer.write(`return (`).indent(() => {
      writer.write(`<View style={${getStylePrefix('root')}.root}>`).indent(() => {
        writeChildren(writer, data, settings, data.tree, getStylePrefix, isPreview);
      });
      writer.writeLine(`</View>`);
    });
    writer.writeLine(');');
  });
}
