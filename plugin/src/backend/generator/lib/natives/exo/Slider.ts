import {getFillToken} from 'backend/parser/lib';

interface SliderTokens {
  fillRange: string,
  fillTrack: string,
  fillThumb: string,
}

export function Slider(root: ComponentNode) {
  const nodeRange = root.findOne(c => c.name === 'range' && c.type === 'RECTANGLE') as RectangleNode;
  const nodeTrack = root.findOne(c => c.name === 'track' && c.type === 'RECTANGLE') as RectangleNode;
  const nodeThumb = root.findOne(c => c.name === 'thumb' && c.type === 'ELLIPSE') as EllipseNode;
  return slider({
    fillRange: getFillToken(nodeRange),
    fillTrack: getFillToken(nodeTrack),
    fillThumb: getFillToken(nodeThumb),
  }).slice(1);
}

export const slider = (_: SliderTokens) => `
import {Slider as SliderX} from 'react-exo/slider';
import {withUnistyles} from 'react-native-unistyles';

const Slider = withUnistyles(SliderX, (theme) => ({
  rangeColor: ${_.fillRange},
  trackColor: ${_.fillTrack},
  thumbColor: ${_.fillThumb},
})) as unknown as typeof SliderX;

export {Slider};
`;
