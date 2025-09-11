import * as React from 'react';
import { ImageProps, ImageStyle, StyleProp } from 'react-native';
import { Filters } from './types';
export interface FilterImageProps extends ImageProps {
    style?: StyleProp<ImageStyle & {
        filter?: string | Filters;
    }> | undefined;
    filters?: Filters;
}
export declare const FilterImage: (props: FilterImageProps) => React.JSX.Element | null;
//# sourceMappingURL=FilterImage.d.ts.map