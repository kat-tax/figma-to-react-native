import React from 'react';
import type { PressableProps as Props, View } from 'react-native';
import type { UnistylesValues } from '../../types';
type Variants = Record<string, string | boolean | undefined>;
type WebPressableState = {
    pressed: boolean;
    hovered: boolean;
    focused: boolean;
};
type WebPressableStyle = ((state: WebPressableState) => UnistylesValues) | UnistylesValues;
export declare const Pressable: React.ForwardRefExoticComponent<Props & {
    variants?: Variants;
    style?: WebPressableStyle;
} & React.RefAttributes<View>>;
export {};
//# sourceMappingURL=Pressable.d.ts.map