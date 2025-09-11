export declare const isDefined: <T>(value: T) => value is NonNullable<T>;
export declare const deepMergeObjects: <T extends Record<PropertyKey, any>>(...sources: Array<T>) => T;
export declare const copyComponentProperties: (Component: any, UnistylesComponent: any) => any;
export declare const isUnistylesMq: (mq: string) => boolean;
export declare const parseMq: (mq: string) => {
    minWidth: number | undefined;
    maxWidth: number | undefined;
    minHeight: number | undefined;
    maxHeight: number | undefined;
};
export declare const isValidMq: (parsedMQ: ReturnType<typeof parseMq>) => boolean;
//# sourceMappingURL=utils.d.ts.map