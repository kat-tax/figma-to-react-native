import { Hfs } from '../../hfs';
import { FileSystem } from 'react-native-file-access';
import { HfsImpl, HfsDirectoryEntry } from '../../hfs.types';
/**
 * A class representing React Native implementation of Hfs.
 */
export declare class ZipHfsImpl implements HfsImpl {
    #private;
    /**
     * Creates a new instance.
     */
    constructor({ root }: {
        root: typeof FileSystem;
    });
    /**
     * Reads a file and returns the contents as an Uint8Array.
     * @throws {Error} If the file cannot be read.
     * @throws {TypeError} If the file path is not a string.
     */
    bytes(filePath: string): Promise<Uint8Array | undefined>;
    /**
     * Writes a value to a file, creating any necessary directories along the way.
     * If the value is a string, UTF-8 encoding is used.
     * @throws {TypeError} If the file path is not a string.
     * @throws {Error} If the file cannot be written.
     */
    write(filePath: string, contents: Uint8Array | string): Promise<void>;
    /**
     * Appends a value to a file. If the value is a string, UTF-8 encoding is used.
     * @throws {TypeError} If the file path is not a string.
     * @throws {Error} If the file cannot be appended to.
     */
    append(filePath: string, contents: Uint8Array): Promise<void>;
    /**
     * Checks if a file exists.
     * @throws {Error} If the operation fails with a code other than ENOENT.
     */
    isFile(filePath: string): Promise<boolean>;
    /**
     * Checks if a directory exists.
     * @throws {Error} If the operation fails with a code other than ENOENT.
     */
    isDirectory(dirPath: string): Promise<boolean>;
    /**
     * Creates a directory recursively.
     */
    createDirectory(dirPath: string): Promise<void>;
    /**
     * Deletes a file or empty directory.
     * @throws {TypeError} If the file or directory path is not a string.
     * @throws {Error} If the file or directory cannot be deleted.
     */
    delete(filePath: string): Promise<boolean>;
    /**
     * Deletes a file or directory recursively.
     * @throws {TypeError} If the file or directory path is not a string.
     * @throws {Error} If the file or directory cannot be deleted.
     * @throws {Error} If the file or directory is not found.
     */
    deleteAll(filePath: string): Promise<boolean>;
    /**
     * Lists the files and directories in a directory.
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
     * @throws {Error} If the source file does not exist.
     * @throws {Error} If the source file is a directory.
     * @throws {Error} If the destination file is a directory.
     */
    copy(source: string, destination: string): Promise<void>;
    /**
     * Copies a file or directory from one location to another.
     * @throws {Error} If the source file or directory does not exist.
     * @throws {Error} If the destination file or directory is a directory.
     */
    copyAll(source: string, destination: string): Promise<void>;
    /**
     * Moves a file from the source path to the destination path.
     * @throws {TypeError} If the file paths are not strings.
     * @throws {Error} If the file cannot be moved.
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
export declare class ZipHfs extends Hfs implements HfsImpl {
    /** Creates a new instance. */
    constructor({ root }: {
        root: typeof FileSystem;
    });
}
export declare const mount: () => Promise<ZipHfs>;
