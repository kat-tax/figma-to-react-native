export enum NodeAttrGroup {
  Props = 'props',
  Motions = 'motions',
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
  Function = 'function',
}

export type NodeAttrData = Record<
  NodeAttrGroup,
  Array<NodeAttrRule>
>;

export type NodeAttrRule = {
  uuid: string,
  name: string,
  data: null | undefined | string | number | boolean | Array<number | string> | NodeMotionData,
  type: NodeAttrType,
  desc: string,
  opts?: Array<string>,
};

export type NodeMotionData = {
  trans?: NodeMotionTransitionData;
  loop?: {
    delay: number;
  }
  opacity?: number;
  scale?: number;
  rotate?: {
    mode: '2D' | '3D';
    x?: number;
    y?: number;
    z?: number;
  };
  skew?: {
    x: number;
    y: number;
  };
  offset?: {
    x: number;
    y: number;
  };
}

export type NodeMotionTransitionData = {
  type: 'tween' | 'spring';
  time?: number;
  delay?: number;
  bezier?: [number, number, number, number];
  spring?: {
    type: 'time' | 'physics';
    bounce?: number;
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}
