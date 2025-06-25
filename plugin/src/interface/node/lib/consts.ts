import {NodeAttrType} from 'types/node';

export const MOTION_ATTRS = [
  {name: 'initial', type: NodeAttrType.Motion},
  {name: 'hover', type: NodeAttrType.Motion},
  {name: 'press', type: NodeAttrType.Motion},
  {name: 'enter', type: NodeAttrType.Motion},
  {name: 'exit', type: NodeAttrType.Motion},
];

export const VISIBILITY_ATTRS = [
  {name: 'platform', type: NodeAttrType.Enum, opts: ['Web', 'iOS', 'Android', 'macOS', 'Windows']},
  {name: 'native', type: NodeAttrType.Boolean},
  {name: 'touch', type: NodeAttrType.Boolean},
];
