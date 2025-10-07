export declare const reduceObject: <TObj extends Record<string, any>, TReducer>(obj: TObj, reducer: (value: TObj[keyof TObj], key: keyof TObj) => TReducer) => { [K in keyof TObj]: TReducer; };
export declare const keyInObject: <T extends Record<string, any>>(obj: T, key: PropertyKey) => key is keyof T;
export declare const isServer: () => boolean;
export declare const error: (message: string) => Error;
export declare const equal: <T>(a: T, b: T) => boolean;
export declare const hyphenate: (propertyName: string) => string;
export declare const serialize: (obj: string | number | object) => string;
export declare const generateHash: (value: any) => string;
//# sourceMappingURL=common.d.ts.map