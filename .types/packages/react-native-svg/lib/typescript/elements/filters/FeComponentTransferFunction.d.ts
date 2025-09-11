import React from 'react';
import { NumberArray, NumberProp } from '../../lib/extract/types';
import FilterPrimitive from './FilterPrimitive';
type FunctionChannel = 'R' | 'G' | 'B' | 'A' | 'UNKNOWN';
type FunctionType = 'identity' | 'table' | 'discrete' | 'linear' | 'gamma';
export type FeComponentTransferFunctionProps = {
    type: FunctionType;
    tableValues?: NumberArray;
    slope?: NumberProp;
    intercept?: NumberProp;
    amplitude?: NumberProp;
    exponent?: NumberProp;
    offset?: NumberProp;
};
export default class FeComponentTransferFunction extends FilterPrimitive<FeComponentTransferFunctionProps> {
    channel: FunctionChannel;
    static defaultProps: React.ComponentProps<typeof FeComponentTransferFunction>;
    render(): null;
}
export type FeFuncRProps = FeComponentTransferFunctionProps;
export declare class FeFuncR extends FeComponentTransferFunction {
    static displayName: string;
    channel: FunctionChannel;
}
export type FeFuncGProps = FeComponentTransferFunctionProps;
export declare class FeFuncG extends FeComponentTransferFunction {
    static displayName: string;
    channel: FunctionChannel;
}
export type FeFuncBProps = FeComponentTransferFunctionProps;
export declare class FeFuncB extends FeComponentTransferFunction {
    static displayName: string;
    channel: FunctionChannel;
}
export type FeFuncAProps = FeComponentTransferFunctionProps;
export declare class FeFuncA extends FeComponentTransferFunction {
    static displayName: string;
    channel: FunctionChannel;
}
export {};
//# sourceMappingURL=FeComponentTransferFunction.d.ts.map