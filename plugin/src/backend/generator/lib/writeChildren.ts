import CodeBlockWriter from 'code-block-writer';
import {NodeAttrType} from 'types/node';
import {PAGES_SPECIAL} from 'config/consts';
import {createIdentifierPascal} from 'common/string';
import {round} from 'common/number';
import {
  getPage,
  getFillToken,
  getNodeAttrs,
  getInstanceStyles,
  getComponentPropName,
  getComponentInstanceInfo,
} from 'backend/parser/lib';

import {writeLayout} from './writeLayout';
import {writePropsAttrs} from './writePropsAttrs';

import type {ParseData, ParseNodeTree, ParseNodeTreeItem} from 'types/parse';
import type {NodeAttrData, NodeAttrRule} from 'types/node';
import type {ProjectSettings} from 'types/settings';
import type {ComponentInfo} from 'types/component';
import type {ImportFlags} from './writeImports';

export type StylePrefixMapper = (slug: string, isDynamic: boolean) => string;
export type WriteChildrenState = {
  flags: ImportFlags,
  data: ParseData,
  infoDb: Record<string, ComponentInfo> | null,
  settings: ProjectSettings,
  pressables?: string[][],
  getStyleProp: StylePrefixMapper,
  getIconProp: StylePrefixMapper,
}

export function writeChildren(
  writer: CodeBlockWriter,
  children: ParseNodeTree,
  state: WriteChildrenState,
) {
  for (const child of children) {
    const slug = state.data.children?.find(c => c.node === child.node)?.slug;
    const pressId = state.pressables?.find(e => e?.[1] === slug)?.[2];
    const isPress = Boolean(pressId);
    const isVariant = !!(child.node as SceneNode & VariantMixin).variantProperties;
    const master = isVariant ? child.node.parent : child.node;
    const attrs = getNodeAttrs(child.node);
    const conds = getConditional(attrs, (master as SceneNode)?.componentPropertyReferences);
    const isCond = conds.length > 0;
    if (isPress)
      state.flags.reactNative.Pressable = true;
    if (isCond && conds.some(c => c.includes('Platform.'))) // TODO: refactor
      state.flags.reactNative.Platform = true;
    if (isCond && conds.some(c => c.includes('isTouch()'))) // TODO: refactor
      state.flags.exoUtils.isTouch = true;
    if (isCond && conds.some(c => c.includes('isNative()'))) // TODO: refactor
      state.flags.exoUtils.isNative = true;
    writer.conditionalWriteLine(isCond, `{${conds.join(' && ')} && `);
    writer.withIndentationLevel((isCond ? 1 : 0) + writer.getIndentationLevel(), () => {
      writer.conditionalWriteLine(isPress, `<Pressable onPress={props.${pressId}}>`);
      writer.withIndentationLevel((isPress ? 1 : 0) + writer.getIndentationLevel(), () => {
        writeChild(writer, child, slug, attrs, isCond, state);
      });
      writer.conditionalWriteLine(isPress, `</Pressable>`);
    });
    writer.conditionalWriteLine(isCond, `}`);
  }
}

function writeChild(
  writer: CodeBlockWriter,
  child: ParseNodeTreeItem,
  slug: string,
  attrs: NodeAttrData,
  isCond: boolean,
  state: WriteChildrenState,
) {
  const {data, settings, pressables, getStyleProp, getIconProp} = state;

  // Derived data
  const propRefs = child.node.componentPropertyReferences;
  const instance = getComponentInstanceInfo(child.node as InstanceNode);
  const swapNodeProp = getComponentPropName(propRefs?.mainComponent);
  const isRootPressable = pressables?.find(e => e[1] === 'root' || !e[1]) !== undefined;
  const isInstance = child.node.type === 'INSTANCE';
  const isInput = child.node.type === 'TEXT' && child.node.name.toLowerCase().startsWith('textinput');
  const isText = child.node.type === 'TEXT';
  const isSwap = Boolean(swapNodeProp);
  const isIcon = isInstance
    && child.node.name.includes(':')
    && getPage((child.node as InstanceNode).mainComponent)?.name === PAGES_SPECIAL.ICONS

  // Icon node
  if (isIcon) {
    state.flags.exoIcon.Icon = true;
    const icon = getIconProp(slug, isRootPressable);
    // Swap icon, override props for this instance
    if (isSwap) {
      const statement = `Icon.New(props.${swapNodeProp}, ${icon})`;
      writer.writeLine((isCond ? '' : '{') + statement + (isCond ? '' : '}'));
    // Explicit icon, use Icon component directly
    } else {
      writer.writeLine(`<Icon style={${icon}}/>`);
    }
    return;
  }

  // Asset node
  const asset = data.assetData?.[child.node.id];
  if (asset) {
    // Vector node
    if (asset.isVector) {
      const vectorTag = '<' + asset.name + '/>';
      writer.writeLine(vectorTag);
    // Asset node
    } else {
      const [assetType, assetSource, ...assetProps] = asset.rawName.split('|');
      const width = round(asset.width);
      const height = round(asset.height);
      const sizeProps = `width={${width}} height={${height}}`;
      const animProps = assetProps?.length
        ? ' ' + assetProps.map(a => a?.trim()).join(' ')
        : ' autoplay loop';
      switch (assetType?.trim().toLowerCase()) {
        case 'lottie':
          writer.writeLine(`<Lottie url="${assetSource?.trim()}"${animProps} ${sizeProps}/>`);
          state.flags.exoLottie.Lottie = true;
          break;
        case 'rive':
          writer.writeLine(`<Rive url="${assetSource?.trim()}"${animProps} ${sizeProps}/>`);
          state.flags.exoRive.Rive = true;
          break;
        default:
          if (asset.isVideo) {
            writer.writeLine(`<Video url="${assetSource?.trim()}" poster={${asset.name}} ${sizeProps}/>`);
            state.flags.exoVideo.Video = true;
          } else {
            const extraProps = asset.thumb ? ` thumbhash="${asset.thumb}"` : '';
            writer.writeLine(`<Image url={${asset.name}} ${sizeProps}${extraProps}/>`);
            state.flags.exoImage.Image = true;
          }
          break;
      }
    }
    return;
  }

  // Swap node
  if (isSwap) {
    const statement = `props.${swapNodeProp}`;
    writer.writeLine(isCond ? statement : `{${statement}}`);
    return;
  }

  // Normal node
  let jsxTag: string;
  let jsxTagWithProps: string;
  let jsxStyleProp: string;
  let jsxAttrProps: Array<NodeAttrRule> = [];
  let jsxMotionProps: Array<NodeAttrRule> = [];

  // Custom props (via prototype interaction)
  if (attrs?.props?.length > 0) {
    jsxAttrProps = attrs.props;
  }

  // Motion props
  if (attrs?.motions?.length > 0) {
    jsxMotionProps = attrs.motions;
    state.flags.exoMotion.Motion = true;
  }

  // Instance style overrides
  let hasStyleOverride = false;
  if (isInstance) {
    const masterStyles = data.stylesheet[(child.node as InstanceNode).mainComponent.id];
    const instanceStyles = data.stylesheet[child.node.id];
    if (masterStyles && instanceStyles) {
      const {hasChanges} = getInstanceStyles(masterStyles, instanceStyles);
      hasStyleOverride = hasChanges;
    }
  }

  // Styles prop
  if (slug && (!isInstance || hasStyleOverride)) {
    jsxStyleProp = `${getStyleProp(slug, isRootPressable)}`;
  }

  // Component props
  const jsxProps = writePropsAttrs(new CodeBlockWriter(state.settings.writer), {
    props: instance.node.componentProperties,
    infoDb: state.infoDb,
    nodeId: instance.node.id,
    styleProp: jsxStyleProp,
    attrProps: jsxAttrProps,
    motionProps: jsxMotionProps,
    forceMultiLine: isInput,
  });

  // Create instance tag
  if (isInstance) {
    jsxTag = createIdentifierPascal(instance.main.name);
    jsxTagWithProps = jsxTag + jsxProps;
    if (jsxTagWithProps.includes('<Icon'))
      state.flags.exoIcon.Icon = true;
  // Create primitive tag
  } else {
    jsxTag = getTagName(child.node.type, attrs?.motions?.length > 0);
    jsxTagWithProps = jsxTag + jsxProps;
    if (!jsxTag.startsWith('Motion.'))
      state.flags.reactNative[jsxTag] = true;
  }

  // No children, self closing tag
  if (!isText && !child.children) {
    writer.writeLine(`<${jsxTagWithProps}/>`);
    return;
  }

  // Text properties
  const textPropId = propRefs?.characters;
  const textPropName = textPropId ? getComponentPropName(textPropId) : null;
  const textPropValue = textPropName
    ? `props.${textPropName}`
    : (child.node as TextNode).characters || '';

  // Text input detected
  if (isInput) {
    //state.flags.reactNative.TextInput = true;
    state.flags.exoTextInput.TextInput = true;
    writer.write('<TextInput').write(jsxProps).indent(() => {
      // Placeholder (props value)
      if (textPropValue.startsWith('props.')) {
        writer.writeLine(`placeholder={${textPropValue}}`);
      // Placeholder (explict), translate
      } else if (settings?.translate) {
        state.flags.lingui.useLingui = true;
        writer.writeLine(`placeholder={t\`${textPropValue}\`}`);
      } else {
        writer.writeLine(`placeholder={\`${textPropValue}}\``);
      }
      writer.write(`uniProps={theme => (`);
      writer.inlineBlock(() => {
        writer.writeLine(`placeholderTextColor: ${getFillToken(child.node as TextNode)},`);
      });
      writer.write(`)}`);
    });
    writer.write(`/>`);
    return;
  }

  // Child nodes, open tag and write children
  writer.write(`<${jsxTagWithProps.trimEnd()}>`).indent(() => {
    switch (jsxTag) {
      case 'View':
      case 'Motion.View':
        writeLayout(writer, child.node.id, child.children, {
          data,
          settings,
          infoDb: state.infoDb,
          pressables,
          flags: state.flags,
          getStyleProp,
          getIconProp,
        });
        break;
      case 'Text':
      case 'Motion.Text':
        // Component property string
        if (textPropValue.startsWith('props.')) {
          writer.write(`{${textPropValue}}`);
        // Explicit string
        } else {
          if (settings?.translate) {
            state.flags.lingui.useLingui = true;
            writer.write('{t`' + textPropValue + '`}');
          } else {
            writer.write(`{\`${textPropValue}\`}`);
          }
        }
        break;
    }
  });

  // Closing tag
  writer.writeLine(`</${jsxTag}>`);
}

function getConditional(
  attrs: NodeAttrData,
  propRefs: SceneNode['componentPropertyReferences'],
): string[] {
  const getName = (r: NodeAttrRule) => {
    const n = r.type === NodeAttrType.Boolean
      && !r.data ? '!' : '';
    switch (r.name) {
      case 'touch': return n + 'isTouch()';
      case 'native': return n + 'isNative()';
      case 'platform': return n + 'Platform.OS';
      default: return r.name;
    }
  };

  const getOperator = (r: NodeAttrRule) => {
    switch (r.name) {
      case 'touch': return '';
      case 'native': return '';
      default: return ' === ';
    }
  };

  const getData = (r: NodeAttrRule) => {
    switch (r.type) {
      case NodeAttrType.Boolean: return '';
      case NodeAttrType.String: return `'${r.data}'`;
      case NodeAttrType.Number: return r.data;
      case NodeAttrType.Function: return r.data;
      case NodeAttrType.Motion: return `props.${getComponentPropName(propRefs?.mainComponent)}`;
      case NodeAttrType.Tuple: return JSON.stringify(r.data);
      case NodeAttrType.Enum: return `'${r.data.toString().toLowerCase()}'`;
      case NodeAttrType.Blank: return 'null';
      default: r.type satisfies never;
    }
  };

  /** These visibility attributes are handled in the stylesheet */
  const ignoredAttrs = ['breakpoint', 'container'];

  return [
    Boolean(propRefs?.visible)
      && `props.${getComponentPropName(propRefs?.visible)}`,
    ...attrs?.visibilities
      ?.filter(v => v.data !== null && v.name !== '')
      ?.filter(v => !ignoredAttrs.includes(v.name))
      ?.map(v => `${getName(v)}${getOperator(v)}${getData(v)}`),
  ].filter(Boolean);
}

function getTagName(type: string, hasMotion: boolean): 'View' | 'Text' | 'Image' | 'Motion.View' | 'Motion.Text' | 'Motion.Image' {
  switch (type) {
    case 'TEXT':
      return hasMotion ? 'Motion.Text' : 'Text';
    case 'IMAGE':
      return hasMotion ? 'Motion.Image' : 'Image';
    case 'COMPONENT':
    case 'INSTANCE':
    case 'RECTANGLE':
    case 'ELLIPSE':
    case 'FRAME':
    default:
      return hasMotion ? 'Motion.View' : 'View';
  }
}
