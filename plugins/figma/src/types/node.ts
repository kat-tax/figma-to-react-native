export enum NodeAttrGroup {
  Properties = 'properties',
  Animations = 'animations',
  Interactions = 'interactions',
  Visibilities = 'visibilities',
  Dynamics = 'dynamics',
}

export enum NodeAttrType {
  Blank = 'blank',
  Enum = 'enum',
  Tuple = 'tuple',
  Number = 'number',
  String = 'string',
  Boolean = 'boolean',
  Motion = 'motion',
}

export type NodeAttrData = Record<
  NodeAttrGroup,
  Array<NodeAttrRule>
>;

export type NodeAttrRule = {
  uuid: string,
  name: string,
  data: null | undefined | string | number | boolean | Array<number | string>,
  type: NodeAttrType,
  desc: string,
  opts?: Array<string>,
};
