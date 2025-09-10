import * as React from 'react';
import type { ImageProps as RNImageProps, NativeSyntheticEvent, ImageLoadEventData } from 'react-native';
import type { CommonPathProps, NumberProp } from '../lib/extract/types';
import Shape from './Shape';
export interface ImageProps extends CommonPathProps {
    x?: NumberProp;
    y?: NumberProp;
    width?: NumberProp;
    height?: NumberProp;
    xlinkHref?: RNImageProps['source'] | string;
    href?: RNImageProps['source'] | string;
    preserveAspectRatio?: string;
    opacity?: NumberProp;
    onLoad?: (e: NativeSyntheticEvent<ImageLoadEventData>) => void;
}
export default class SvgImage extends Shape<ImageProps> {
    static displayName: string;
    static defaultProps: {
        x: number;
        y: number;
        width: number;
        height: number;
        preserveAspectRatio: string;
    };
    render(): React.JSX.Element;
}
//# sourceMappingURL=Image.d.ts.map