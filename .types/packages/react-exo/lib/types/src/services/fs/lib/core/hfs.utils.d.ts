/**
 * Asserts that the given path is a valid file path.
 * @param fileOrDirPath The path to check.
 * @throws {TypeError} When the path is not a non-empty string.
 */
export declare function assertValidFileOrDirPath(fileOrDirPath: any): void;
/**
 * Asserts that the given file contents are valid.
 * @param contents The contents to check.
 * @throws {TypeError} When the contents are not a string or ArrayBuffer.
 */
export declare function assertValidFileContents(contents: any): void;
/**
 * Converts the given contents to Uint8Array.
 * @param contents The data to convert.
 * @returns The converted Uint8Array.
 * @throws {TypeError} When the contents are not a string or ArrayBuffer.
 */
export declare function toUint8Array(contents: any): Uint8Array;
/**
 * A class representing a log entry.
 */
export declare class LogEntry {
    /**
     * The type of log entry.
     * @type {string}
     */
    type: string;
    /**
     * The data associated with the log entry.
     * @type {any}
     */
    data: any;
    /**
     * The time at which the log entry was created.
     * @type {number}
     */
    timestamp: number;
    /**
     * Creates a new instance.
     * @param {string} type The type of log entry.
     * @param {any} [data] The data associated with the log entry.
     */
    constructor(type: string, data: any);
}
/**
 * Error to represent when an impl is already set.
 */
export declare class ImplAlreadySetError extends Error {
    constructor();
}
/**
 * Error to represent when a method is missing on an impl.
 */
export declare class NoSuchMethodError extends Error {
    constructor(methodName: string);
}
/**
 * Error to represent when a method is not supported on an impl. This happens
 * when a method on `Hfs` is called with one name and the corresponding method
 * on the impl has a different name. (Example: `text()` and `bytes()`.)
 */
export declare class MethodNotSupportedError extends Error {
    constructor(methodName: string);
}
/**
 * Error thrown when a file or directory is not found.
 */
export declare class NotFoundError extends Error {
    name: string;
    code: string;
    constructor(message: string);
}
/**
 * Error thrown when an operation is not permitted.
 */
export declare class PermissionError extends Error {
    name: string;
    code: string;
    constructor(message: string);
}
/**
 * Error thrown when an operation is not allowed on a directory.
 */
export declare class DirectoryError extends Error {
    name: string;
    code: string;
    constructor(message: string);
}
/**
 * Error thrown when an operation is not allowed on a file.
 */
export declare class FileError extends Error {
    name: string;
    code: string;
    constructor(message: string);
}
/**
 * Error thrown when a directory is not empty.
 */
export declare class NotEmptyError extends Error {
    name: string;
    code: string;
    constructor(message: string);
}
