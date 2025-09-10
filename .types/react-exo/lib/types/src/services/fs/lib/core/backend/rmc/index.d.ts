import { Hfs } from '../../hfs';
import { RemarkableApi, Entry } from 'rmapi-js';
import { HfsImpl, HfsDirectoryEntry } from '../../hfs.types';
/**
 * A class representing the ReMarkable implementation of Hfs.
 */
export declare class RmcHfsImpl implements HfsImpl {
    #private;
    private lookup;
    private retry;
    /**
     * Creates a new instance.
     */
    constructor({ root, items }: {
        root: RemarkableApi;
        items: Entry[];
    });
    /**
     * Reads a file and returns the contents as an Uint8Array.
     * @throws {FileError} If the file does not exist.
     */
    bytes(filePath: string): Promise<Uint8Array | undefined>;
    /**
     * Writes a value to a file, creating any necessary directories along the way.
     * If the value is a string, UTF-8 encoding is used.
     * @throws {FileError} If the file does not exist.
     */
    write(filePath: string, contents: Uint8Array | string): Promise<void>;
    /**
     * Appends a value to a file. If the value is a string, UTF-8 encoding is used.
     * @throws {FileError} If the file does not exist.
     */
    append(filePath: string, contents: Uint8Array | string): Promise<void>;
    /**
     * Checks if a file exists.
     */
    isFile(filePath: string): Promise<boolean>;
    /**
     * Checks if a directory exists.
     */
    isDirectory(dirPath: string): Promise<boolean>;
    /**
     * Creates a directory recursively.
     * @throws {NotEmptyError} If the directory is not empty.
     */
    createDirectory(dirPath: string): Promise<void>;
    /**
     * Deletes a file or empty directory.
     * @throws {NotEmptyError} If the directory is not empty.
     * @throws {NotFoundError} If the file or directory does not exist.
     */
    delete(filePath: string): Promise<boolean>;
    /**
     * Deletes a file or directory recursively.
     */
    deleteAll(filePath: string): Promise<boolean>;
    /**
     * Lists the files and directories in a directory.
     * @throws {NotFoundError} If the directory does not exist.
     */
    list(dirPath: string): AsyncIterable<HfsDirectoryEntry>;
    /**
     * Returns the size of a file.
     */
    size(filePath: string): Promise<number | undefined>;
    /**
     * Returns the last modified date of a file or directory. This method handles ENOENT errors
     * and returns undefined in that case.
     */
    lastModified(fileOrDirPath: string): Promise<Date | undefined>;
    /**
     * Copies a file from one location to another.
     */
    copy(source: string, destination: string): Promise<void>;
    /**
     * Copies a file or directory from one location to another.
     * @throws {NotFoundError} If the source file or directory does not exist.
     */
    copyAll(source: string, destination: string): Promise<void>;
    /**
     * Moves a file from the source path to the destination path.
     * @throws {NotFoundError} If the source file or destination file does not exist.
     */
    move(source: string, destination: string): Promise<void>;
    /**
     * Moves a file or directory from one location to another.
     * @throws {Error} If the source file or directory does not exist.
     */
    moveAll(source: string, destination: string): Promise<void>;
}
/**
 * A class representing a file system utility library.
 */
export declare class RmcHfs extends Hfs implements HfsImpl {
    constructor({ root, items }: {
        root: RemarkableApi;
        items: Entry[];
    });
}
export declare const mount: (token?: string) => Promise<RmcHfs>;
