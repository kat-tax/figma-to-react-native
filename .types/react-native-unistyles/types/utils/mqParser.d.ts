import type { Optional, RNValue, ScreenSize } from '../types';
type ParsedMqDimension = {
    from: number;
    to: number;
};
export type UnistylesParsedMq = {
    width?: ParsedMqDimension;
    height?: ParsedMqDimension;
};
export declare const parseMq: (mq: string) => UnistylesParsedMq;
export declare const isUnistylesMq: (mq: string) => boolean;
export declare const isValidMq: (parsedMq: UnistylesParsedMq) => boolean;
export declare const isWithinTheWidthAndHeight: (parsedMq: UnistylesParsedMq, screenSize: ScreenSize) => boolean;
export declare const getKeyForUnistylesMediaQuery: (mediaQueries: Array<[string, RNValue]>, screenSize: ScreenSize) => Optional<string>;
export {};
//# sourceMappingURL=mqParser.d.ts.map