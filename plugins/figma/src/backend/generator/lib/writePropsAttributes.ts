import CodeBlockWriter from 'code-block-writer';
import {NodeAttrType} from 'types/node';

import * as parser from 'backend/parser/lib';
import * as string from 'common/string';

import type {NodeAttrRule} from 'types/node';

export function writePropsAttributes(
  writer: CodeBlockWriter,
  props: ComponentPropertyDefinitions | ComponentProperties,
  testProp?: string,
  styleProp?: string,
  attrProps?: Array<NodeAttrRule>,
  extraProps?: Array<[string, string]>,
) {
  const _props = props ? Object.entries(props) : [];

  // Write inline props (no component/attr props)
  if (!_props.length && !attrProps?.length) {
    // Write style prop
    if (styleProp)
      writer.write(` style={${styleProp}}`);
    // Write test prop
    if (testProp)
      writer.write(` testID="${testProp}"`);
    // Write extra props
    extraProps?.forEach(prop =>
      writer.writeLine(`${prop[0]}=${prop[1]}`));
    return writer.toString();
  }

  // Write indented props
  writer.newLine();
  writer.indent(() => {
    // Write style prop
    if (styleProp)
      writer.writeLine(`style={${styleProp}}`);
    // Write test prop
    if (testProp)
      writer.writeLine(`testID="${testProp}"`);
    // Write component props
    _props.sort(parser.sortComponentPropsDef).forEach(prop =>
      writeProp(writer, prop, props, !testProp));
    // Write extra props
    extraProps?.forEach(prop =>
      writer.writeLine(`${prop[0]}=${prop[1]}`));
    // Write attribute props
    attrProps?.forEach(attr =>
      writeAttr(writer, attr));
  });
  return writer.toString().trimEnd();
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
    writePropComponent(writer, propId, k, v, props, excludeTestIds);
  }
}

export function writePropComponent(
  writer: CodeBlockWriter,
  propKey: string,
  propName: string,
  componentId: string,
  props: ComponentPropertyDefinitions | ComponentProperties,
  excludeTestIds?: boolean,
  returnOnlyProps?: boolean,
) {
  const node = figma.getNodeById(componentId) as ComponentNode | InstanceNode;
  const info = parser.getComponentInfo(node);
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
  const jsxProps = writePropsAttributes(
    new CodeBlockWriter(writer.getOptions()),
    instance?.componentProperties,
    jsxTestProp,
    undefined,
    [], // TODO: add attr props
    jsxExtraProps,
  );

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
