import { sha256result } from './asm';
export declare const sha256HashSize = 32;
export declare const sha256BlockSize = 64;
export declare abstract class Hash<T extends sha256result> {
    result: Uint8Array | null;
    pos: number;
    len: number;
    asm: T | undefined;
    heap: Uint8Array | undefined;
    BLOCK_SIZE: number;
    HASH_SIZE: number;
    abstract acquire_asm(): {
        heap: Uint8Array;
        asm: T;
    };
    abstract release_asm(): void;
    reset(): this;
    process(data: Uint8Array): this;
    finish(): this;
}
export declare class Sha256 extends Hash<sha256result> {
    static NAME: string;
    NAME: string;
    HASH_SIZE: number;
    BLOCK_SIZE: number;
    constructor();
    acquire_asm(): {
        heap: Uint8Array;
        asm: sha256result;
    };
    release_asm(): void;
    static bytes(data: Uint8Array): Uint8Array | null;
}
