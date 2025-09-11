export type ZipInput = string | Blob | Uint8Array | ReadableStream<Uint8Array>;
export type ZipEntryInput = string | Uint8Array | Blob | ReadableStream<Uint8Array>;
export type ReadFileOptions = {
    encoding?: unknown;
    flag?: string;
};
export type WriteFileOptions = {
    encoding?: unknown;
    flag?: string;
};
