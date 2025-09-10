import React from 'react';
import { GestureResponderEvent } from 'react-native';
import { BaseProps } from './types';
export declare class WebShape<P extends BaseProps = BaseProps> extends React.Component<P> {
    [x: string]: unknown;
    protected tag?: React.ElementType;
    protected prepareProps(props: P): P;
    elementRef: React.MutableRefObject<SVGElement | null>;
    lastMergedProps: Partial<P>;
    /**
     * disclaimer: I am not sure why the props are wrapped in a `style` attribute here, but that's how reanimated calls it
     */
    setNativeProps(props: {
        style: P;
    }): void;
    _remeasureMetricsOnActivation: () => void;
    touchableHandleStartShouldSetResponder?: (e: GestureResponderEvent) => boolean;
    touchableHandleResponderMove?: (e: GestureResponderEvent) => void;
    touchableHandleResponderGrant?: (e: GestureResponderEvent) => void;
    touchableHandleResponderRelease?: (e: GestureResponderEvent) => void;
    touchableHandleResponderTerminate?: (e: GestureResponderEvent) => void;
    touchableHandleResponderTerminationRequest?: (e: GestureResponderEvent) => boolean;
    constructor(props: P);
    render(): JSX.Element;
}
//# sourceMappingURL=WebShape.d.ts.map