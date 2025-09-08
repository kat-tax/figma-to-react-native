import {getFillToken} from 'backend/parser/lib';

interface SliderTokens {
  fillRange: string,
  fillTrack: string,
  fillThumb: string,
}

export function Slider(component: ComponentNode) {
  const nodeRange = component.findOne(c => c.name === 'Range' && c.type === 'RECTANGLE') as RectangleNode;
  const nodeTrack = component.findOne(c => c.name === 'Track' && c.type === 'RECTANGLE') as RectangleNode;
  const nodeThumb = component.findOne(c => c.name === 'Thumb' && c.type === 'ELLIPSE') as EllipseNode;
  return slider({
    fillRange: getFillToken(nodeRange),
    fillTrack: getFillToken(nodeTrack),
    fillThumb: getFillToken(nodeThumb),
  }).slice(1);
}

export const slider = (_: SliderTokens) => `
import {Slider as ExoSlider} from 'react-exo/slider';
import {withUnistyles} from 'react-native-unistyles';

export interface SliderProps {
  onChange: (min: number, max?: number) => void,
  name?: string,
  value?: number,
  step?: number,
  minimumValue?: number,
  maximumValue?: number,
  trackColor?: string,
  rangeColor?: string,
  thumbColor?: string,
  testID?: string
}

export const Slider = withUnistyles(ExoSlider, (theme) => ({
  rangeColor: ${_.fillRange},
  trackColor: ${_.fillTrack},
  thumbColor: ${_.fillThumb},
}));
`;
