import CodeBlockWriter from 'code-block-writer';
import {NodeAttrType} from 'types/node';
import {getEasingPreset} from 'interface/node/lib/transition';

import * as parser from 'backend/parser/lib';
import * as string from 'common/string';

import type {NodeAttrRule, NodeMotionData, NodeMotionTransitionData} from 'types/node';
import type {ComponentInfo} from 'types/component';

export interface WritePropsAttributesConfig {
  props?: ComponentPropertyDefinitions | ComponentProperties;
  infoDb?: Record<string, ComponentInfo> | null;
  nodeId?: string;
  styleProp?: string;
  attrProps?: Array<NodeAttrRule>;
  motionProps?: Array<NodeAttrRule>;
  extraProps?: Array<[string, string]>;
  forceMultiLine?: boolean;
  isRoot?: boolean;
}

export function writePropsAttributes(writer: CodeBlockWriter, data: WritePropsAttributesConfig) {
  const _props = data.props ? Object.entries(data.props) : [];
  const _noAttrProps = !data.attrProps || data.attrProps?.every(attr => attr.data === null);
  const _noMotionProps = !data.motionProps || data.motionProps?.every(attr => attr === null);

  // Write test id prop
  if (data.nodeId) {
    writer.write(data.isRoot
      ? ` testID={props.testID ?? "${data.nodeId}"}`
      : ` testID="${data.nodeId}"`
    );
  }

  // Write inline props (no component/attr props)
  if (!_props.length && _noAttrProps && _noMotionProps && !data.forceMultiLine) {
    // Write style prop
    if (data.styleProp)
      writer.write(` style={${data.styleProp}}`);
    // Write extra props
    data.extraProps?.forEach(prop =>
      writer.writeLine(` ${prop[0]}=${prop[1]}`));
    return writer.toString().trimEnd();
  }

  // Write indented props
  writer.newLine();
  writer.indent(() => {
    // Write style prop
    if (data.styleProp)
      writer.writeLine(`style={${data.styleProp}}`);
    // Write component props
    _props.sort(parser.sortComponentPropsDef).forEach(prop =>
      writeProp(writer, prop, data.props, data.infoDb, !data.nodeId));
    // Write motion props
    writeMotion(writer, data.motionProps);
    // Write extra props
    data.extraProps?.forEach(prop =>
      writer.writeLine(`${prop[0]}=${prop[1]}`));
    // Write attribute props
    data.attrProps?.forEach(attr =>
      writeAttr(writer, attr));
  });
  return writer.toString();
}

function writeMotion(writer: CodeBlockWriter, props?: Array<NodeAttrRule>) {
  if (!props?.length) return;

  let transition: NodeMotionTransitionData;

  for (const prop of props) {
    const data = prop?.data as NodeMotionData;
    if (!data) continue;
    const interaction = getMotionPropName(prop.name);
    if (!interaction) continue;
    // TODO: change UI for master transition and per prop transition
    transition = data.trans;
    // TODO: initial values should be set for initial interaction if set by another interaction
    writer.write(`${interaction}={`).inlineBlock(() => {
      if (data.opacity !== undefined)
        writer.writeLine(`opacity: ${data.opacity},`);
      if (data.scale !== undefined)
        writer.writeLine(`scale: ${data.scale},`);
      if (data.rotate?.mode === '2D') {
        if (data.rotate?.x !== undefined)
          writer.writeLine(`rotate: '${data.rotate.x}deg',`);
      } else if (data.rotate?.mode === '3D') {
        if (data.rotate?.x !== undefined)
          writer.writeLine(`rotateX: '${data.rotate.x}deg',`);
        if (data.rotate?.y !== undefined)
          writer.writeLine(`rotateY: '${data.rotate.y}deg',`);
        if (data.rotate?.z !== undefined)
          writer.writeLine(`rotateZ: '${data.rotate.z}deg',`);
      }
      if (data.skew?.x !== undefined)
        writer.writeLine(`skewX: '${data.skew.x}deg',`);
      if (data.skew?.y !== undefined)
        writer.writeLine(`skewY: '${data.skew.y}deg',`);
      if (data.offset?.x !== undefined)
        writer.writeLine(`x: ${data.offset.x},`);
      if (data.offset?.y !== undefined)
        writer.writeLine(`y: ${data.offset.y},`);
    });
    writer.write('}');
    writer.newLine();
  }

  if (transition) {
    writer.write('transition={').inlineBlock(() => {
      writer.writeLine(`type: '${transition.type}',`);
      // TODO: support loop
      // writer.writeLine(`loop: -1,`);
      if (transition.type === 'tween') {
        const preset = getEasingPreset(transition.bezier);
        writer.writeLine(`ease: '${preset ? preset.id : transition.bezier}',`);
        if (transition.time)
          writer.writeLine(`duration: ${transition.time * 1000},`);
      } else {
        const {spring} = transition;
        if (spring.type === 'physics') {
          writer.writeLine(`stiffness: ${spring.stiffness},`);
          writer.writeLine(`damping: ${spring.damping},`);
          writer.writeLine(`mass: ${spring.mass},`);
        } else if (spring.type === 'time') {
          writer.writeLine(`duration: ${transition.time * 1000},`);
          writer.writeLine(`bounciness: ${spring.bounce},`);
        }
      }
      if (transition.delay) {
        writer.writeLine(`delay: ${transition.delay * 1000},`);
      }
    });
    writer.write('}');
    writer.newLine();
  }
}

export function writeAttr(
  writer: CodeBlockWriter,
  attr: NodeAttrRule,
) {
  if (attr.data === undefined
    || attr.data === null
    || attr.name === '') return;
  switch (attr.type) {
    case NodeAttrType.Number:
      writer.writeLine(`${attr.name}={${attr.data}}`);
      return;
    case NodeAttrType.Boolean:
      writer.writeLine(attr.data ? attr.name : `${attr.name}={false}`);
      return;
    case NodeAttrType.Enum:
      writer.writeLine(`${attr.name}="${attr.data}"`);
      return;
    case NodeAttrType.Tuple:
      if (!Array.isArray(attr.data)) return;
      writer.writeLine(`${attr.name}={${attr.data.join(',')}}`);
      return;
    case NodeAttrType.String:
      if (typeof attr.data !== 'string') return;
      writer.writeLine(attr.data.includes('${') || attr.data.includes('"')
        ? `${attr.name}={\`${string.escapeBacktick(attr.data)}\`}`
        : `${attr.name}="${attr.data}"`);
      return;
    case NodeAttrType.Function:
      if (typeof attr.data !== 'string') return;
      writer.writeLine(`${attr.name}={${attr.data}}`);
      return;
    case NodeAttrType.Motion:
    case NodeAttrType.Blank:
      return;
    default: attr.type satisfies never;
  }
}

export function writeProp(
  writer: CodeBlockWriter,
  [propId, prop]: [string, {type: string, value: string, defaultValue: string}],
  props: ComponentPropertyDefinitions | ComponentProperties,
  infoDb: Record<string, ComponentInfo> | null,
  excludeTestIds?: boolean,
) {
  const k = parser.getComponentPropName(propId);
  const v = prop.value || prop.defaultValue;
  // Boolean prop
  if (prop.type === 'BOOLEAN') {
    writer.writeLine(v
      ? k
      : `${k}={false}`
    );
  // Text props k={v} and gets quotes escaped
  } else if (prop.type === 'TEXT') {
    writer.writeLine(v.includes('${') || v.includes('"')
      ? `${k}={\`${string.escapeBacktick(v)}\`}`
      : `${k}="${v}"`);
  // Variants are sanitized for invalid identifier chars
  } else if (prop.type === 'VARIANT') {
    writer.writeLine(`${k}="${string.createIdentifier(v)}"`);
  // Instance swap (JSX tag as prop value)
  } else if (prop.type === 'INSTANCE_SWAP') {
    writePropComponent(writer, propId, k, v, props, infoDb, excludeTestIds);
  }
}

export function writePropComponent(
  writer: CodeBlockWriter,
  propKey: string,
  propName: string,
  componentId: string,
  props: ComponentPropertyDefinitions | ComponentProperties,
  infoDb: Record<string, ComponentInfo> | null,
  excludeTestIds?: boolean,
  returnOnlyProps?: boolean,
) {
  const node = parser.getNode(componentId) as ComponentNode | InstanceNode;
  const info = parser.getComponentInfo(node, infoDb);
  const isIcon = parser.isNodeIcon(info.target);

  // Props for this instance swap
  let jsxTestProp: string;
  let jsxExtraProps: Array<[string, string]> = [];

  // Is icon, add name prop
  if (isIcon) {
    jsxExtraProps.push(['name', `"${info.target.name}"`]);
  // Otherwise add test prop
  } else if (!excludeTestIds) {
    jsxTestProp = node.id;
  }

  // Determine instance
  const instance = node.type === 'INSTANCE' ? node : node.instances
    .find(i => i?.componentPropertyReferences?.mainComponent === propKey);

  // Look for visibility prop on this instance swap
  if (typeof props[instance?.componentPropertyReferences?.visible] !== 'undefined') {
    // If visible is false, return an empty string so not prop (k=v) is written
    if ((props[instance?.componentPropertyReferences?.visible] as any)?.value === false)
      return ['', [info.name, info.path]];
  }

  // Generate JSX props
  const jsxProps = writePropsAttributes(new CodeBlockWriter(writer.getOptions()), {
    props: instance?.componentProperties,
    infoDb,
    nodeId: jsxTestProp,
    extraProps: jsxExtraProps,
    attrProps: [], // TODO: add attr props
  });

  // Write only props
  if (returnOnlyProps) {
    writer.write(jsxProps);
    return;
  }

  // Write full component prop
  const tagName = !isIcon ? string.createIdentifierPascal(info.name) : 'Icon';
  writer.writeLine(`${propName}={`);
  writer.indent(() => {
    writer.writeLine(`<${tagName}${jsxProps}/>`);
  });
  writer.writeLine('}');
}

function getMotionPropName(name: string) {
  switch (name) {
    case 'initial':
      return 'initial';
    case 'hover':
      return 'whileHover';
    case 'press':
      return 'whileTap';
    case 'enter':
      return 'animate';
    case 'exit':
      return 'exit';
    default:
      return null;
  }
}
