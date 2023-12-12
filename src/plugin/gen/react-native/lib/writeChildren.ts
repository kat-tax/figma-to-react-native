import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal} from 'common/string';
import {
  getPage,
  getPropsJSX,
  getPropName,
  getFillToken,
  getInstanceInfo,
  getPressReaction,
  getCustomReaction,
} from 'plugin/fig/lib';

import type {ParseData, ParseNodeTree, ParseNodeTreeItem} from 'types/parse';
import type {Settings} from 'types/settings';

type StylePrefixMapper = (slug: string) => string;

export function writeChildren(
  writer: CodeBlockWriter,
  data: ParseData,
  settings: Settings,
  children: ParseNodeTree,
  getStylePrefix: StylePrefixMapper,
  pressables?: string[][],
) {
  const state = {writer, data, settings, pressables, getStylePrefix};
  children.forEach(child => {
    const slug = data.children?.find(c => c.node === child.node)?.slug;
    const pressId = pressables?.find(e => e?.[1] === slug)?.[2];
    const isVariant = !!(child.node as SceneNode & VariantMixin).variantProperties;
    const masterNode = isVariant ? child.node.parent : child.node;
    const propRefs = (masterNode as SceneNode)?.componentPropertyReferences;
    const isPressable = Boolean(pressId);
    const isConditional = Boolean(propRefs?.visible);
    writer.conditionalWriteLine(isConditional, `{props.${getPropName(propRefs?.visible)} && `);
    writer.withIndentationLevel((isConditional ? 1 : 0) + writer.getIndentationLevel(), () => {
      writer.conditionalWriteLine(isPressable, `<Pressable onPress={props.${pressId}}>`);
      writer.withIndentationLevel((isPressable ? 1 : 0) + writer.getIndentationLevel(), () => {
        writeChild(child, slug, isConditional, state);
      });
      writer.conditionalWriteLine(isPressable, `</Pressable>`);
    });
    writer.conditionalWriteLine(isConditional, `}`);
  });
}

function writeChild(
  child: ParseNodeTreeItem,
  slug: string,
  isConditional: boolean,
  state: {
    writer: CodeBlockWriter,
    data: ParseData,
    settings: Settings,
    pressables?: string[][],
    getStylePrefix: StylePrefixMapper,
  },
) {
  const {writer, data, settings, pressables, getStylePrefix} = state;

  // Derived data
  const testID = ` testID="${child.node.id}"`;
  const propRefs = child.node.componentPropertyReferences;
  const instance = getInstanceInfo(child.node as InstanceNode);
  const reaction = getCustomReaction(instance.node);
  const pressable = getPressReaction(instance.node);
  const swapNodeProp = getPropName(propRefs?.mainComponent);
  const jsxBaseProps = getPropsJSX(instance.node.componentProperties, data.colorsheet, data.meta.includes);
  const hasCustomProps = reaction?.type === 'URL';
  const isRootPressable = pressables?.find(e => e[1] === 'root' || !e[1]) !== undefined;
  const isInstance = child.node.type === 'INSTANCE';
  const isAsset = child.node.type === 'VECTOR' || (child.node.isAsset && !isInstance);
  const isText = child.node.type === 'TEXT';
  const isSwap = Boolean(swapNodeProp);
  const isIcon = isInstance
    && child.node.name.includes(':')
    && getPage((child.node as InstanceNode).mainComponent)?.name === 'Icons'

  // Icon node
  if (isIcon) {
    const iconVector = instance.node.children?.find(c => c.type === 'VECTOR') as VectorNode;
    const iconColor = getFillToken(iconVector);
    const hasVariant = !!Object.values(data.variants.fills[slug]);
    const fillToken = hasVariant ? `colors.${slug}` : iconColor;
    const dynamic = isRootPressable ? '(e)' : '';
    const style = `{color: ${fillToken}${dynamic}}`;
    // Swap icon, override props for this instance
    if (isSwap) {
      const statement = `cloneElement(props.${swapNodeProp}, `;
      writer.write((isConditional ? '' : '{') + statement).inlineBlock(() => {
        writer.writeLine(`style: ${style},`);
        writer.writeLine(`size: ${child.node.width},`);
      });
      writer.write(')' + (isConditional ? '' : '}'));
      writer.newLine();
    // Explicit icon, use Icon component directly
    } else {
      writer.writeLine(`<Icon icon="${child.node.name}" size={${child.node.width}} style={${style}}/>`);
    }
    return;
  }

  // Asset node
  if (isAsset) {
    const asset = data.assetData[child.node.id];
    if (asset) {
      // Vector node
      if (asset.isVector) {
        const vectorTag = '<' + asset.name + '/>'
        writer.writeLine(vectorTag);
      // Raster node
      } else {
        const uri = asset.name;
        const style = `{width: ${asset.width}, height: ${asset.height}}`;
        writer.writeLine(`<Image source={{uri: ${uri}}} style={${style}} resizeMode="cover"/>`);
      }
    } else {
      writer.writeLine(`<View/>`);
    }
    return;
  }

  // Swap node
  if (isSwap) {
    const statement = `props.${swapNodeProp}`;
    writer.writeLine(isConditional ? statement : `{${statement}}`);
    return;
  }

  // Normal node
  let jsxTag: string;
  let jsxTagWithProps: string;
  let jsxCustomProps = '';

  // Custom props (via prototype interaction)
  if (hasCustomProps) {
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
    jsxTagWithProps = jsxTag + jsxCustomProps + jsxBaseProps + testID;

  // Create primitive tag
  } else {
    // Determine if root node is wrapped in a pressable
    const dynamic = isRootPressable ? '(e)' : '';
    const styles = slug ? ` style={${getStylePrefix(slug)}.${slug}${dynamic}}` : '';
    jsxTag = getTag(child.node.type);
    jsxTagWithProps = jsxTag + styles + jsxCustomProps + jsxBaseProps + testID;
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
            writer.write(`{\`${propValue}\`}`);
          }
        }
        break;
      case 'View':
        writeChildren(writer, data, settings, child.children, getStylePrefix, pressables);
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
