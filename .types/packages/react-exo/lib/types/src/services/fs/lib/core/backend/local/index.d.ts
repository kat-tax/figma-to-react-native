import { Hfs } from '../../hfs';
import { HfsImpl, HfsDirectoryEntry } from '../../hfs.types';
/**
 * A class representing the Origin Private File System implementation of Hfs.
 */
export declare class WebHfsImpl implements HfsImpl {
    #private;
    /**
     * Creates a new instance.
     */
    constructor({ root }: {
        root: FileSystemDirectoryHandle;
    });
    /**
     * Reads a file and returns the contents as an Uint8Array.
     */
    bytes(filePath: string | URL): Promise<Uint8Array | undefined>;
    /**
     * Writes a value to a file. If the value is a string, UTF-8 encoding is used.
     */
    write(filePath: string | URL, contents: Uint8Array): Promise<void>;
    /**
     * Appends a value to a file. If the value is a string, UTF-8 encoding is used.
     */
    append(filePath: string | URL, contents: Uint8Array): Promise<void>;
    /**
     * Checks if a file exists.
     */
    isFile(filePath: string | URL): Promise<boolean>;
    /**
     * Checks if a directory exists.
     */
    isDirectory(dirPath: string | URL): Promise<boolean>;
    /**
     * Creates a directory recursively.
     */
    createDirectory(dirPath: string | URL): Promise<void>;
    /**
     * Deletes a file or empty directory.
     */
    delete(fileOrDirPath: string | URL): Promise<boolean>;
    /**
     * Deletes a file or directory recursively.
     */
    deleteAll(fileOrDirPath: string | URL): Promise<boolean>;
    /**
     * Returns a list of directory entries for the given path.
     */
    list(dirPath: string | URL): AsyncIterable<HfsDirectoryEntry>;
    /**
     * Returns the size of a file.
     */
    size(filePath: string | URL): Promise<number | undefined>;
    /**
     * Returns the last modified date of a file or directory. This method handles ENOENT errors
     * and returns undefined in that case.
     */
    lastModified(fileOrDirPath: string | URL): Promise<Date | undefined>;
    /**
     * Copies a file from one location to another.
     */
    copy(source: string | URL, destination: string | URL): Promise<void>;
    /**
     * Copies a file or directory from one location to another.
     */
    copyAll(source: string | URL, destination: string | URL): Promise<void>;
    /**
     * Moves a file from the source path to the destination path.
     */
    move(source: string | URL, destination: string | URL): Promise<void>;
    /**
     * Moves a file or directory from one location to another.
     */
    moveAll(source: string | URL, destination: string | URL): Promise<void>;
}
/**
 * A class representing a file system utility library.
 */
export declare class WebHfs extends Hfs {
    /** Creates a new instance. */
    constructor({ root }: {
        root: FileSystemDirectoryHandle;
    });
}
export declare const mount: () => Promise<WebHfs>;
