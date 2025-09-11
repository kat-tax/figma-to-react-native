import { ComponentClass } from 'react';
import type { ViewProps, ViewStyle } from 'react-native';
import type { MotionComponentProps } from './Interfaces';
export type LinearGradientPoint = {
    x: number;
    y: number;
};
export type LinearGradientProps = ViewProps & {
    colors?: string[];
    locations?: number[] | null;
    start?: LinearGradientPoint | null;
    end?: LinearGradientPoint | null;
};
declare function setLinearGradientComponent(linearGradient: any): void;
declare const MotionLinearGradient: <TAnimate, TAnimateProps extends Partial<Omit<LinearGradientProps, "locations" | "style">>>(props: MotionComponentProps<ComponentClass<Omit<LinearGradientProps, "locations">>, ViewStyle, TAnimate, TAnimateProps, Omit<LinearGradientProps, "locations" | "style">> & LinearGradientProps) => JSX.Element;
export { setLinearGradientComponent, MotionLinearGradient };
