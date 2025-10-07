import { Stat } from './models';
import { ZipInput, ZipEntryInput, ReadFileOptions, WriteFileOptions } from './types';
import { ZipDirectoryEntry } from '@zip.js/zip.js';
export declare class ZipFS {
    private zip;
    constructor(src?: ZipInput);
    /**
     * Mounts a source zip file.
     * @param src - The source to mount.
     * @throws {Error} If the source is invalid.
     */
    private mount;
    /**
     * Looks up an entry in the zip file.
     * @param path - The path to the entry.
     * @returns The parent directory and the entry name.
     * @throws {ENOENT} If the entry is not found.
     */
    private lookup;
    export(): Promise<string>;
    /**
     * Reads a file from the zip file.
     * @param path - The path to the file.
     * @returns The file.
     * @throws {EISDIR} If the entry is not a file.
     * @throws {ENOENT} If the entry is not found.
     */
    readFile(path: string, options?: ReadFileOptions): Promise<Uint8Array | string>;
    /**
     * Writes a file to the zip file.
     * @param path - The path to the file.
     * @param data - The data to write.
     * @throws {EISDIR} If the entry is not a file.
     * @throws {ENOENT} If the entry is not found.
     */
    writeFile(path: string, data: ZipEntryInput, options?: WriteFileOptions): Promise<void>;
    /**
     * Removes an entry from the zip file.
     * @param path - The path to the entry.
     * @throws {ENOENT} If the entry is not found.
     */
    unlink(path: string): Promise<void>;
    /**
     * Reads a directory from the zip file.
     * @param path - The path to the directory.
     * @returns The directory.
     * @throws {ENOENT} If the entry is not found.
     */
    readdir(path: string): Promise<string[]>;
    /**
     * Creates a directory in the zip file.
     * @param path - The path to the directory.
     * @throws {ENOENT} If the entry is not found.
     */
    mkdir(path: string): Promise<ZipDirectoryEntry>;
    /**
     * Removes a directory from the zip file.
     * @param path - The path to the directory.
     * @throws {ErrorNotFound} If the entry is not found.
     */
    rmdir(path: string): Promise<void>;
    /**
     * Returns the stats of an entry in the zip file.
     * @param path - The path to the entry.
     * @returns The stats of the entry.
     * @throws {ErrorNotFound} If the entry is not found.
     */
    stat(path: string): Promise<Stat | false>;
}
