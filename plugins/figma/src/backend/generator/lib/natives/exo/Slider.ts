import * as parser from 'backend/parser/lib';

export function Slider(component: ComponentNode) {
  const nodeRange = component.findOne(c => c.name === 'Range' && c.type === 'RECTANGLE') as RectangleNode;
  const nodeTrack = component.findOne(c => c.name === 'Track' && c.type === 'RECTANGLE') as RectangleNode;
  const nodeThumb = component.findOne(c => c.name === 'Thumb' && c.type === 'ELLIPSE') as EllipseNode;

  return template({
    fillRange: parser.getFillToken(nodeRange),
    fillTrack: parser.getFillToken(nodeTrack),
    fillThumb: parser.getFillToken(nodeThumb),
    importStyles: `import {useStyles} from 'styles';\n`,
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
import {Slider as SliderBase} from 'react-exo/slider';
${_.importStyles}
export interface SliderProps {
  ${props.map(p => p.join(': ')).join(',\n  ')}
}

export function Slider(props: SliderProps) {
  const {theme} = useStyles();
  return (
    <SliderBase
      rangeColor={props.rangeColor || ${_.fillRange}}
      trackColor={props.trackColor || ${_.fillTrack}}
      thumbColor={props.thumbColor || ${_.fillThumb}}
      {...props}
    />
  );
}
`;
