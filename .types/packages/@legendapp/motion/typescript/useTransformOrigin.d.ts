import type { LayoutChangeEvent } from 'react-native';
import type { TransformOrigin } from './Interfaces';
export declare const useTransformOrigin: (transformOrigin: {
    x?: TransformOrigin;
    y?: TransformOrigin;
}, transform: any[], onLayoutProp: (e: LayoutChangeEvent) => void) => (e: LayoutChangeEvent) => void;
