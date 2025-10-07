import { Stat } from './models';
export interface PosixFS {
    /**
     * Make directory
     * @param filepath
     * @param options
     */
    mkdir(filepath: string, options?: MKDirOptions): Promise<void>;
    /**
     * Remove directory
     * @param filepath
     * @param options
     */
    rmdir(filepath: string, options?: undefined): Promise<void>;
    /**
     * Read directory
     *
     * The Promise return value is an Array of strings. NOTE: To save time, it is NOT SORTED. (Fun fact: Node.js' readdir output is not guaranteed to be sorted either. I learned that the hard way.)
     * @param filepath
     * @param options
     * @returns The file list.
     */
    readdir(filepath: string, options?: undefined): Promise<string[]>;
    readFile(filepath: string, options: 'utf8' | {
        encoding: 'utf8';
    }): Promise<string | Uint8Array>;
    readFile(filepath: string, options?: unknown): Promise<Uint8Array>;
    writeFile(filepath: string, data: Uint8Array | string, options?: WriteFileOptions | string): Promise<void>;
    /**
     * Delete a file
     * @param filepath
     * @param options
     */
    unlink(filepath: string, options?: undefined): Promise<void>;
    /**
     * Rename a file or directory
     * @param oldFilepath
     * @param newFilepath
     */
    rename(oldFilepath: string, newFilepath: string): Promise<void>;
    /**
     * The result is a Stat object similar to the one used by Node but with fewer and slightly different properties and methods.
     * @param filepath
     * @param options
     */
    stat(filepath: string, options?: undefined): Promise<Stat>;
    /**
     * Like fs.stat except that paths to symlinks return the symlink stats not the file stats of the symlink's target.
     * @param filepath
     * @param options
     */
    lstat(filepath: string, options?: undefined): Promise<Stat>;
    /**
     * Create a symlink at filepath that points to target.
     * @param target
     * @param filepath
     */
    symlink(target: string, filepath: string): Promise<void>;
    /**
     * Read the target of a symlink.
     * @param filepath
     * @param options
     * @returns The link string.
     */
    readlink(filepath: string, options?: undefined): Promise<string>;
    /**
     * Create or change the stat data for a file backed by HTTP. Size is fetched with a HEAD request. Useful when using an HTTP backend without urlauto set, as then files will only be readable if they have stat data. Note that stat data is made automatically from the file /.superblock.txt if found on the server. /.superblock.txt can be generated or updated with the included [standalone script](https://github.com/isomorphic-git/lightning-fs/blob/main/src/superblocktxt.js).
     * @param filepath
     * @param options
     */
    backFile(filepath: string, options?: BackFileOptions): Promise<void>;
    /**
     * @param filepath
     * @returns The size of a file or directory in bytes.
     */
    du(filepath: string): Promise<number>;
}
export interface MKDirOptions {
    /**
     * Posix mode permissions
     * @default 0o777
     */
    mode: number;
}
export interface BackFileOptions {
    /**
     * Posix mode permissions
     * @default 0o666
     */
    mode: number;
}
export interface ReadFileOptions {
    encoding?: 'utf8';
}
export interface WriteFileOptions {
    /**
     * Posix mode permissions
     * @default 0o777
     */
    mode: number;
    encoding?: 'utf8';
}
