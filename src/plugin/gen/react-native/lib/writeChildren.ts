import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal} from 'common/string';
import {getPropName, propsToString, getInstanceInfo, getCustomReaction, getPressReaction} from 'plugin/fig/lib';

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
  rootPressables?: string[][],
) {
  children.forEach(child => {
    const slug = data.children?.find(c => c.node === child.node)?.slug;
    const pressId = rootPressables?.find(e => e?.[1] === slug)?.[2];
    const isVariant = !!(child.node as SceneNode & VariantMixin).variantProperties;
    const masterNode = isVariant ? child.node.parent : child.node;
    const propRefs = (masterNode as SceneNode)?.componentPropertyReferences;
    const isDynamic = Boolean(propRefs?.visible);
    const isPressable = Boolean(pressId);

    writer.conditionalWriteLine(isDynamic, `{props.${getPropName(propRefs?.visible)} && `);
    writer.withIndentationLevel((isDynamic ? 1 : 0) + writer.getIndentationLevel(), () => {
      writer.conditionalWriteLine(isPressable, `<Pressable onPress={props.${pressId}}>`);
      writer.withIndentationLevel((isPressable ? 1 : 0) + writer.getIndentationLevel(), () => {
        writeChild(
          writer,
          data,
          settings,
          child,
          slug,
          getStylePrefix,
          isDynamic,
          isPreview,
          rootPressables,
        );
      });
      writer.conditionalWriteLine(isPressable, `</Pressable>`);
    });
    writer.conditionalWriteLine(isDynamic, `}`);
  });
}

function writeChild(
  writer: CodeBlockWriter,
  data: ParseData,
  settings: Settings,
  child: ParseNodeTreeItem,
  slug: string,
  getStylePrefix: StylePrefixMapper,
  isConditional: boolean = false,
  isPreview?: boolean,
  rootPressables?: string[][],
) {
  // console.log('writeChild:', child.node.type, child.node.name, child.node.isAsset);

  const props = (child.node as InstanceNode)?.componentProperties;
  const propRefs = child.node.componentPropertyReferences;
  const pressable = getPressReaction(child.node as InstanceNode);
  const reaction = getCustomReaction(child.node as InstanceNode);
  const instance = getInstanceInfo(child.node as InstanceNode);
  const propJSX = propsToString(props);
  const isText = child.node.type === 'TEXT';
  const isInstance = child.node.type === 'INSTANCE';
  const isAsset = (child.node.isAsset && !isInstance) || child.node.type === 'VECTOR';
  const isCustom = reaction?.type === 'URL';

  // console.log(child.node.name, reaction, pressable, rootPressables);

  // Component instance swap
  const swapComponent = propRefs?.mainComponent;
  const swapComponentName = swapComponent ? getPropName(swapComponent) : null;
  if (swapComponentName) {
    const statement = `props.${swapComponentName}`;
    writer.writeLine(isConditional ? statement : `{${statement}}`);
    return;
  }

  // Asset node (svg or image)
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

  // JSX tag will change depending on node type
  let jsxTag: string;
  let jsxTagWithProps: string;
  let jsxCustomProps = '';

  // Custom props from the interaction to inject
  if (isCustom) {
    jsxCustomProps = reaction.url
      ?.split(',')
      ?.map(p => p.trim())
      ?.map(p => {
        // Prop -> root prop match alias
        const relation = p?.split('->');
        if (relation.length === 2) {
          const [k, v] = relation;
          if (k && v) {
            return ` ${getPropName(k)}={props.${getPropName(v)}}`;
          }
        }
        // Purely custom input (raw k=v)
        const custom = p?.split('=');
        if (custom.length === 1 && custom[0])
          return ' ' + custom[0];
        if (custom.length === 2 && custom[1])
          return ' ' + custom.join('=');
        // Invalid input
        return '';
      })?.join('');
  }

  // Create instance tag
  if (isInstance) {
    jsxTag = createIdentifierPascal(instance.main.name);
    jsxTagWithProps = jsxTag + jsxCustomProps + propJSX;

  // Create primitive tag
  } else {
    const styles = slug ? ` style={${getStylePrefix(slug)}.${slug}}` : '';
    jsxTag = getTag(child.node.type);
    jsxTagWithProps = jsxTag + jsxCustomProps + propJSX + styles;
  }

  // No children, self closing tag
  if (!isText && !child.children) {
    writer.writeLine(`<${jsxTagWithProps}/>`);
    return;
  }

  // Child nodes, open tag and write children
  writer.write(`<${jsxTagWithProps}>`).indent(() => {
    switch (jsxTag) {
      case 'Text':
        const propId = propRefs?.characters;
        const propName = propId ? getPropName(propId) : null;
        const propValue = propName
          ? `props.${propName}`
          : (child.node as TextNode).characters || '';
        if (propValue.startsWith('props.')) {
          writer.write(`{${propValue}}`);
        } else {
          if (settings?.react?.addTranslate) {
            writer.write(`<Trans>${propValue}</Trans>`);
          } else {
            writer.write(propValue);
          }
        }
        break;
      case 'View':
        writeChildren(
          writer,
          data,
          settings,
          child.children,
          getStylePrefix,
          isPreview,
          rootPressables,
        );
        break;
    }
  });

  // Closing tag
  writer.writeLine(`</${jsxTag}>`);
}

function getTag(type: string) {
  switch (type) {
    case 'TEXT':
      return 'Text';
    case 'IMAGE':
      return 'Image';
    case 'VECTOR':
      return 'Svg';
    case 'COMPONENT':
    case 'INSTANCE':
    case 'RECTANGLE':
    case 'ELLIPSE':
    case 'FRAME':
    default:
      return 'View';
  }
}
