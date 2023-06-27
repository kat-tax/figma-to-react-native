import CodeBlockWriter from 'code-block-writer';
import {getName, getSlug, propsToString, sortProps, getInstanceInfo} from 'modules/fig/utils';

import type {ParseData, ParseNodeTree, ParseNodeTreeItem} from 'types/figma';
import type {Settings} from 'types/settings';

export function writeImports(
  writer: CodeBlockWriter,
  data: ParseData,
  settings: Settings,
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

  // Import subcomponents
  Object.entries(data.meta.components).forEach(([_id, node]) => {
    const component = getName(node.name);
    writer.write(`import {${component}} from`);
    writer.space();
    writer.quote(`./${component}`);
    writer.write(';');
    writer.newLine();
  });

  // Import theme file
  // TODO: do not include if no theme properties are used
  writer.write(`import theme from`);
  writer.space();
  writer.quote(`./theme`);
  writer.write(';');
  writer.newLine();
}

export function writeFunction(
  writer: CodeBlockWriter,
  data: ParseData,
  settings: Settings,
  stylePrefix: string = 'styles',
  variantStyles: any = {},
) {
  // Derived data
  const isVariant = !!(data.root.node as SceneNode & VariantMixin).variantProperties;
  const masterNode = (isVariant ? data.root.node?.parent : data.root.node) as ComponentNode;
  const propDefs = (masterNode as ComponentNode)?.componentPropertyDefinitions;
  const props = propDefs ? Object.entries(propDefs) : [];
  const name = getName(masterNode.name);

  // Component props
  if (props.length > 0) {
    writer.write(`export interface ${name}Props`).block(() => {
      props.sort(sortProps).forEach(([key, prop]) => {
        const {type, variantOptions}: any = prop;
        const propName = getSlug(key.split('#').shift());
        const propCond = type === 'BOOLEAN' ? '?' : '';
        const propType = type === 'VARIANT'
          ? variantOptions.map((v: any) => `'${v}'`).join(' | ')
          : type === 'INSTANCE_SWAP'
            ? `JSX.Element`
            : type === 'TEXT'
              ? 'string'
              : type.toLowerCase();
        writer.writeLine(`${propName}${propCond}: ${propType};`);
      });
    });
    writer.blankLine();
  }

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

  // Component function body and children
  const attrProps = `${props.length > 0 ? `props: ${name}Props` : ''}`;
  writer.write(`export function ${name}(${attrProps})`).block(() => {
    if (isVariant && Object.keys(variantStyles).length > 0)
      writeClasses(writer, variantStyles);
    const getStylePrefix = (key: string) =>
      Object.keys({variantStyles}).includes(key)
        ? 'classes'
        : stylePrefix;
    writer.write(`return (`).indent(() => {
      writer.write(`<View style={${getStylePrefix('root')}.root}>`).indent(() => {
        writeChildren(writer, data, settings, data.tree, getStylePrefix);
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
  getStylePrefix: (key: string) => string,
) {
  children.forEach((child) => {
    // Derived data
    const isVariant = !!(child.node as SceneNode & VariantMixin).variantProperties;
    const masterNode = isVariant ? child.node.parent : child.node;
    const propRefs = (masterNode as SceneNode)?.componentPropertyReferences;
    // Conditional rendering
    if (propRefs?.visible) {
      const name = getSlug(propRefs?.visible.split('#').shift());
      writer.write(`{props.${name} &&`).space().indent(() => {
        writeChild(writer, data, settings, child, getStylePrefix, true);
      }).write('}').newLine();
    // Default rendering
    } else {
      writeChild(writer, data, settings, child, getStylePrefix);
    }
  });
}

export function writeChild(
  writer: CodeBlockWriter,
  data: ParseData,
  settings: Settings,
  child: ParseNodeTreeItem,
  getStylePrefix: (key: string) => string, isConditional: boolean = false,
) {
  // console.log('writeChild:', child.node.type, child.node.name, child.node.isAsset);

  // Common data
  const isText = child.node.type === 'TEXT';
  const isInstance = child.node.type === 'INSTANCE';
  const propRefs = child.node.componentPropertyReferences;

  // Component instance swap
  const swapComponent = propRefs?.mainComponent;
  const swapComponentName = swapComponent ? getSlug(swapComponent.split('#').shift()) : null;
  if (swapComponentName) {
    const statement = `props.${swapComponentName}`;
    writer.writeLine(isConditional ? statement : `{${statement}}`);
    return;
  }

  // Direct asset nodes (svg or image)
  if (child.node.isAsset && child.node.type !== 'INSTANCE') {
    const asset = data.assets[child.node.id];
    if (asset) {
      const style = `{width: ${asset.width}, height: ${asset.height}}`;
      writer.writeLine(`<Image style={${style}} source={{uri: '${asset.data}'}}/>`);
    } else {
      writer.writeLine(`{/* Could not convert asset "${child.node.name}" */}`);
    }
    return;
  }

  // Determine JSX tag
  const slug = getSlug(child.node.name);
  const instance = getInstanceInfo(child.node as InstanceNode);
  const attrProps = propsToString((child.node as any)?.componentProperties);
  const attrStyle = slug ? ` style={${getStylePrefix(slug)}.${slug}}` : '';
  const jsxTag = isInstance ? getName(instance.main.name) : getTag(child.node.type);
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
      const propName = propId ? getSlug(propId.split('#').shift()) : null;
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
      writeChildren(writer, data, settings, child.children, getStylePrefix);
    }
  });

  // Closing tag
  writer.writeLine(`</${jsxTag}>`);
}

export function writeStyleSheet(
  writer: CodeBlockWriter,
  data: ParseData,
  _settings: Settings,
  stylePrefix: string = 'styles',
  variantStyles: any = {},
) {
  writer.write(`const ${stylePrefix} = StyleSheet.create(`).inlineBlock(() => {
    // Root styles
    writeStyle(writer, 'root', data.root.styles);
    if (variantStyles.root) {
      Object.keys(variantStyles.root).forEach(key => {
        writeStyle(writer, `root${key}`, variantStyles.root[key]);
      });
    }
    // Children styles
    for (const child of data.children) {
      if (child.styles) {
        const slug = getSlug(child.node.name);
        writeStyle(writer, slug, child.styles);
        if (variantStyles[slug]) {
          Object.keys(variantStyles[slug]).forEach(key => {
            if (variantStyles[slug][key]) {
              writeStyle(writer, `${slug}${key}`, variantStyles[slug][key]);
            }
          });
        }
      }
    }
  });
  writer.write(');');
}

export function writeStyle(writer: CodeBlockWriter, slug: string, styles: any) {
  const props = Object.keys(styles).filter(c => styles[c] !== undefined);
  if (props.length > 0) {
    writer.write(`${slug}: {`).indent(() => {
      props.forEach(prop => {
        const value = styles[prop];
        writer.write(`${prop}: `);
        if (typeof value === 'number') {
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

export function writeClasses(writer: CodeBlockWriter, variantStyles: any) {
  Object.keys(variantStyles).forEach((k: string) => {
    const mods = Object.keys(variantStyles[k]).filter(v => !!variantStyles[k][v]);
    if (mods.length > 0) {
      mods.forEach(v => writer.writeLine(`const is${v} = props.state === '${v}';`));
    }
  });
  writer.write(`const classes = `).inlineBlock(() => {
    Object.keys(variantStyles).forEach((k: string) => {
      const mods = Object.keys(variantStyles[k]).filter(v => !!variantStyles[k][v]);
      if (mods.length > 0) {
        writer.write(`${k}: [`).indent(() => {
          writer.writeLine(`styles.${k},`);
          mods.forEach(v => {
            writer.writeLine(`props.state === '${v}' && styles.${k}${v},`);
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
