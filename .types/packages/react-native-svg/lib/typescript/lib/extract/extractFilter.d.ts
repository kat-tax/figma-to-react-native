import { FeBlendProps as FeBlendComponentProps } from '../../elements/filters/FeBlend';
import { FeColorMatrixProps as FeColorMatrixComponentProps } from '../../elements/filters/FeColorMatrix';
import { FeCompositeProps as FeCompositeComponentProps } from '../../elements/filters/FeComposite';
import { FeFloodProps as FeFloodComponentProps } from '../../elements/filters/FeFlood';
import { FeGaussianBlurProps as FeGaussianBlurComponentProps } from '../../elements/filters/FeGaussianBlur';
import { FeMergeProps as FeMergeComponentProps } from '../../elements/filters/FeMerge';
import { NativeProps as FeBlendNativeProps } from '../../fabric/FeBlendNativeComponent';
import { NativeProps as FeColorMatrixNativeProps } from '../../fabric/FeColorMatrixNativeComponent';
import { NativeProps as FeCompositeNativeProps } from '../../fabric/FeCompositeNativeComponent';
import { NativeProps as FeFloodNativeProps } from '../../fabric/FeFloodNativeComponent';
import { NativeProps as FeGaussianBlurNativeProps } from '../../fabric/FeGaussianBlurNativeComponent';
import { NativeProps as FeMergeNativeProps } from '../../fabric/FeMergeNativeComponent';
import { NumberProp } from './types';
interface FilterPrimitiveCommonProps {
    x?: NumberProp;
    y?: NumberProp;
    width?: NumberProp;
    height?: NumberProp;
    result?: string;
}
export declare const extractFilter: (props: FilterPrimitiveCommonProps) => FilterPrimitiveCommonProps;
export declare const extractIn: (props: {
    in?: string;
}) => {
    in1: string;
} | {
    in1?: undefined;
};
export declare const extractFeBlend: (props: FeBlendComponentProps) => FeBlendNativeProps;
export declare const extractFeColorMatrix: (props: FeColorMatrixComponentProps) => FeColorMatrixNativeProps;
export declare const extractFeComposite: (props: FeCompositeComponentProps) => FeCompositeNativeProps;
export default function extractFeFlood(props: FeFloodComponentProps): FeFloodNativeProps;
export declare const extractFeGaussianBlur: (props: FeGaussianBlurComponentProps) => FeGaussianBlurNativeProps;
export declare const extractFeMerge: (props: FeMergeComponentProps, parent: unknown) => FeMergeNativeProps;
export {};
//# sourceMappingURL=extractFilter.d.ts.map