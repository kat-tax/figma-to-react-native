export declare class IllegalStateError extends Error {
    constructor(message?: string);
}
export declare function heapInit(heap?: Uint8Array, heapSize?: number): Uint8Array;
export declare function heapWrite(heap: Uint8Array, hpos: number, data: Uint8Array, dpos: number, dlen: number): number;
