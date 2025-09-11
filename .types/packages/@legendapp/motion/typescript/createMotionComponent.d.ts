import React, { ComponentPropsWithRef, ComponentType, ReactElement, Ref } from 'react';
import { Animated } from 'react-native';
import type { ComponentStyle, MotionComponentProps } from './Interfaces';
export declare function createMotionComponent<T extends ComponentType<any>, TExtraProps = {}>(Component: Animated.AnimatedComponent<T> | T): <TAnimate, TAnimateProps>(p: Animated.AnimatedProps<ComponentPropsWithRef<T>> & TExtraProps & MotionComponentProps<T, ComponentStyle<T>, TAnimate, TAnimateProps>, ref: Ref<InstanceType<T>>) => ReactElement;
export declare function createMotionAnimatedComponent<T extends ComponentType<any>>(component: T): <TAnimate, TAnimateProps>(p: Animated.AnimatedProps<React.ComponentPropsWithRef<T>> & MotionComponentProps<T, ComponentStyle<T>, TAnimate, TAnimateProps, unknown>, ref: React.Ref<InstanceType<T>>) => ReactElement;
