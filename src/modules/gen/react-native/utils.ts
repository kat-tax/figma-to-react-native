import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal, createIdentifierCamel, createIdentifier} from 'common/string';
import {getPropName, propsToString, sortProps, getInstanceInfo} from 'modules/fig/utils';

import type {ParseData, ParseNodeTree, ParseNodeTreeItem} from 'types/figma';
import type {Settings} from 'types/settings';

type StylePrefixMapper = (slug: string) => string;

export function writeImports(
  writer: CodeBlockWriter,
  data: ParseData,
  settings: Settings,
  isPreview?: boolean,
) {
  // Import React explicitly if set 
  if (settings?.react?.addImport) {
    writer.write('import React from');
    writer.space();
    writer.quote('react');
    writer.write(';');
    writer.newLine();
  }

  // Import LinguiJS if set and Text primitive is used
  if (settings?.react?.addTranslate && data.meta.primitives.has('Text')) {
    writer.write('import {Trans} from');
    writer.space();
    writer.quote('@lingui/macro');
    writer.write(';');
    writer.newLine();
  }

  // Import primitives
  writer.write(`import {StyleSheet, ${['View', ...data.meta.primitives].join(', ')}} from`);
  writer.space();
  writer.quote('react-native');
  writer.write(';');
  writer.newLine();

  if (!isPreview) {
    // Import subcomponents
    Object.entries(data.meta.components).forEach(([_id, node]) => {
      const component = createIdentifierPascal(node.name);
      writer.write(`import {${component}} from`);
      writer.space();
      writer.quote(`../components/${component}`);
      writer.write(';');
      writer.newLine();
    });

    // Import assets
    Object.entries(data.assets).forEach(([_id, asset]) => {
      writer.write(`import ${asset.name} from`);
      writer.space();
      const base = `../../assets/${asset.isVector ? 'vectors' : 'images'}`;
      const path = `${base}/${asset.name}.${asset.isVector ? 'svg' : 'png'}`;
      writer.quote(path);
      writer.write(';');
      writer.newLine();
    });

    // Import theme file (TODO: do not include if no theme properties are used)
    writer.write(`import theme from`);
    writer.space();
    writer.quote(`../../theme`);
    writer.write(';');
    writer.newLine();
  }
}

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

export function writeChildren(
  writer: CodeBlockWriter,
  data: ParseData,
  settings: Settings,
  children: ParseNodeTree,
  getStylePrefix: StylePrefixMapper,
  isPreview?: boolean,
) {
  children.forEach((child) => {
    // Derived data
    const isVariant = !!(child.node as SceneNode & VariantMixin).variantProperties;
    const masterNode = isVariant ? child.node.parent : child.node;
    const propRefs = (masterNode as SceneNode)?.componentPropertyReferences;
    // Conditional rendering
    if (propRefs?.visible) {
      const name = getPropName(propRefs?.visible);
      writer.write(`{props.${name} &&`).space().indent(() => {
        writeChild(writer, data, settings, child, getStylePrefix, true, isPreview);
      }).write('}').newLine();
    // Default rendering
    } else {
      writeChild(writer, data, settings, child, getStylePrefix, false, isPreview);
    }
  });
}

export function writeChild(
  writer: CodeBlockWriter,
  data: ParseData,
  settings: Settings,
  child: ParseNodeTreeItem,
  getStylePrefix: StylePrefixMapper,
  isConditional: boolean = false,
  isPreview?: boolean,
) {
  // console.log('writeChild:', child.node.type, child.node.name, child.node.isAsset);

  // Common data
  const isText = child.node.type === 'TEXT';
  const isInstance = child.node.type === 'INSTANCE';
  const propRefs = child.node.componentPropertyReferences;

  // Component instance swap
  const swapComponent = propRefs?.mainComponent;
  const swapComponentName = swapComponent ? getPropName(swapComponent) : null;
  if (swapComponentName) {
    const statement = `props.${swapComponentName}`;
    writer.writeLine(isConditional ? statement : `{${statement}}`);
    return;
  }

  // Asset node (svg or image)
  if (child.node.isAsset && child.node.type !== 'INSTANCE') {
    const asset = data.assets[child.node.id];
    if (asset) {
      const style = `{width: ${asset.width}, height: ${asset.height}}`;
      // Embedded asset (preview mode only)
      if (isPreview) {
        if (asset.isVector) {
          writer.writeLine(asset.data);
        } else {
          writer.writeLine(`<Image source={{uri: '${asset.data}'}} style={${style}}/>`);
        }
      // Imported asset (code view & export mode)
      } else {
        if (asset.isVector) {
          writer.writeLine('<' + asset.name + '/>');
        } else {
          writer.writeLine(`<Image source={{uri: ${asset.name}}} style={${style}} contentFit="cover"/>`);
        }
      }
    } else {
      writer.writeLine(`{/* Could not convert asset "${child.node.name}" */}`);
    }
    return;
  }

  // Determine JSX tag
  const node = data.children.find(c => c.node === child.node);
  const instance = getInstanceInfo(child.node as InstanceNode);
  const attrProps = propsToString((child.node as any)?.componentProperties);
  const attrStyle = node.slug ? ` style={${getStylePrefix(node.slug)}.${node.slug}}` : '';
  const jsxTag = isInstance ? createIdentifierPascal(instance.main.name) : getTag(child.node.type);
  const jsxTagWithProps = isInstance
    ? jsxTag + attrProps
    : jsxTag + attrStyle + attrProps;

  // No children, self closing tag
  if (!isText && !child.children) {
    writer.writeLine(`<${jsxTagWithProps}/>`);
    return;
  }

  // Child nodes, open tag and write children
  writer.write(`<${jsxTagWithProps}>`).indent(() => {
    // Text child
    if (isText) {
      const propId = propRefs?.characters;
      const propName = propId ? getPropName(propId) : null;
      const propValue = propName ? `props.${propName}` : (child.node as TextNode).characters || '';
      if (propValue.startsWith('props.')) {
        writer.write(`{${propValue}}`);
      } else {
        if (settings?.react?.addTranslate) {
          writer.write(`<Trans>${propValue}</Trans>`);
        } else {
          writer.write(propValue);
        }
      }
    // View children (recurse)
    } else if (jsxTag === 'View') {
      writeChildren(writer, data, settings, child.children, getStylePrefix, isPreview);
    }
  });

  // Closing tag
  writer.writeLine(`</${jsxTag}>`);
}

export function writeStyleSheet(
  writer: CodeBlockWriter,
  data: ParseData,
  _settings: Settings,
  stylePrefix: string,
) {
  writer.write(`const ${stylePrefix} = StyleSheet.create(`).inlineBlock(() => {
    // Root styles
    writeStyle(writer, 'root', data.root.styles);
    if (data.variants.root) {
      Object.keys(data.variants.root).forEach(key => {
        const className = createIdentifierCamel(`root_${key}`.split(', ').join('_'))
        writeStyle(writer, className, data.variants.root[key]);
      });
    }
    // Children styles
    for (const child of data.children) {
      if (child.styles) {
        writeStyle(writer, child.slug, child.styles);
        if (data.variants[child.slug]) {
          Object.keys(data.variants[child.slug]).forEach(key => {
            if (data.variants[child.slug][key]) {
              const className = createIdentifierCamel(`${child.slug}_${key}`.split(', ').join('_'));
              writeStyle(writer, className, data.variants[child.slug][key]);
            }
          });
        }
      }
    }
  });
  writer.write(');');
}

export function writeStyle(writer: CodeBlockWriter, slug: string, styles: any) {
  const props = Object.keys(styles)
  if (props.length > 0) {
    writer.write(`${slug}: {`).indent(() => {
      props.forEach(prop => {
        const value = styles[prop];
        writer.write(`${prop}: `);
        if (typeof value === 'undefined') {
          writer.quote('unset');
        } else if (typeof value === 'number') {
          writer.write(value.toString());
        } else if (value.startsWith('theme.')) {
          writer.write(value);
        } else {
          writer.quote(value);
        }
        writer.write(',');
        writer.newLine();
      });
    });
    writer.writeLine('},');
  }
}

export function writeClasses(
  writer: CodeBlockWriter,
  data: ParseData,
  componentName: string,
  stylePrefix: string,
) {
  writer.write(`const classes = `).inlineBlock(() => {
    Object.keys(data.variants).forEach((k: string) => {
      const mods = Object.keys(data.variants[k]).filter(v => !!data.variants[k][v]);
      if (mods.length > 0) {
        writer.write(`${k}: [`).indent(() => {
          writer.writeLine(`${stylePrefix}.${k},`);
          mods.reverse().forEach(v => {
            const parts = v.split(', ');
            const cond = parts.map(part => {
              const [state, value] = part.split('=');
              const enumId = `${componentName}${createIdentifierPascal(state)}`;
              return `props.${getPropName(state)} === ${enumId}.${createIdentifierPascal(value)}`
            }).join(' && ');
            const className = `${k}_${v}`.split(', ').join('_').replace(/\=/g, '_');
            writer.writeLine(`${cond} && ${stylePrefix}.${createIdentifierCamel(className)},`);
          });
        });
        writer.writeLine('],');
      }
    });
  });
  writer.write(';');
  writer.blankLine();
}

export function getTag(type: string) {
  switch (type) {
    case 'COMPONENT':
    case 'INSTANCE':
    case 'RECTANGLE':
    case 'ELLIPSE':
    case 'FRAME':
    case 'GROUP':
      return 'View';
    case 'TEXT':
      return 'Text';
    case 'IMAGE':
      return 'Image';
    case 'VECTOR':
      return 'Svg';
    default:
      return 'View';
  }
}
