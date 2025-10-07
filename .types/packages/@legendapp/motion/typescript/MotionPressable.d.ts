import React from 'react';
import { PressableProps } from 'react-native';
export declare const ContextPressable: React.Context<{
    pressed: boolean;
    hovered: boolean;
}>;
export declare function MotionPressable(props: PressableProps): JSX.Element;
