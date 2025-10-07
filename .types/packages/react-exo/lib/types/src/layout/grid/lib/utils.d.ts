export declare function toGCD(numbers: number[]): number;
export declare function toInt(val: string | number, init?: number): number;
export declare function toFloat(val: string | number, init?: number): number;
export declare function toTrimmed(val: string): string;
export declare function toCssUnit(val: string): boolean;
export declare function toCssTransform(val: string): {
    number: number;
    unit: string;
} | null;
