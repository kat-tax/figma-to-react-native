import {getFillToken} from 'backend/parser/lib';

export function Slider(component: ComponentNode) {
  const nodeRange = component.findOne(c => c.name === 'Range' && c.type === 'RECTANGLE') as RectangleNode;
  const nodeTrack = component.findOne(c => c.name === 'Track' && c.type === 'RECTANGLE') as RectangleNode;
  const nodeThumb = component.findOne(c => c.name === 'Thumb' && c.type === 'ELLIPSE') as EllipseNode;

  return template({
    fillRange: getFillToken(nodeRange),
    fillTrack: getFillToken(nodeTrack),
    fillThumb: getFillToken(nodeThumb),
    importStyles: `import {useStyles} from 'react-native-unistyles';\n`,
  }).slice(1);
}

export const props = [
  ['onChange', '(min: number, max?: number) => void'],
  ['name?', 'string'],
  ['value?', 'number'],
  ['step?', 'number'],
  ['minimumValue?', 'number'],
  ['maximumValue?', 'number'],
  ['trackColor?', 'string'],
  ['rangeColor?', 'string'],
  ['thumbColor?', 'string'],
  ['testID?', 'string'],
];

export const template = (_: {
  fillRange: string,
  fillTrack: string,
  fillThumb: string,
  importStyles: string,
}) => `
import {Slider} from 'react-exo/slider';
${_.importStyles}
export interface SliderProps {
  ${props.map(p => p.join(': ')).join(',\n  ')}
}

function SliderThemed(props: SliderProps) {
  const {theme} = useStyles();
  return (
    <Slider
      rangeColor={props.rangeColor || ${_.fillRange}}
      trackColor={props.trackColor || ${_.fillTrack}}
      thumbColor={props.thumbColor || ${_.fillThumb}}
      {...props}
    />
  );
}

export {SliderThemed as Slider};
`;
