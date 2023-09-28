import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal} from 'common/string';
import {getPropName, propsToString, getInstanceInfo} from 'plugin/fig/lib';
import {getTag} from './getTag';

import type {ParseData, ParseNodeTree, ParseNodeTreeItem} from 'types/parse';
import type {Settings} from 'types/settings';

type StylePrefixMapper = (slug: string) => string;

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
  const isAsset = child.node.isAsset && child.node.type !== 'INSTANCE'
    || child.node.type === 'VECTOR';

  if (isAsset) {
    const asset = data.assets[child.node.id];
    if (asset) {
      const style = `{width: ${asset.width}, height: ${asset.height}}`;
      // Embedded asset (preview mode only)
      if (isPreview) {
        if (asset.isVector) {
          writer.writeLine(asset.data);
        } else {
          writer.writeLine(`<Image source={{uri: '${asset.data}'}} style={${style}} contentFit="cover"/>`);
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
      writer.writeLine(`<View/>`);
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
