import { HfsImpl } from './lib/core/hfs.types';
export * from './lib/core/hfs.types';
export type HfsType = 'local';
export interface FSBase {
    init(type?: HfsType): Promise<HfsImpl>;
    watch(path: string, callback: (records: Array<unknown>) => void): Promise<false | (() => void)>;
    pick(options?: PickFilesOptions): Promise<Array<FileSystemOut>>;
    pickDirectory(options?: PickDirectoryOptions): Promise<Array<FileSystemOut>>;
    hash: (file: FileSystemIn, progress?: (bytes: number, total: number) => void, jobId?: number) => Promise<string>;
    cancelHash: (id: number) => void;
    isTextFile: (name: string, buffer?: ArrayBuffer) => Promise<boolean | null>;
    importFiles: (path: string, files: Array<File>) => Promise<void>;
    getDiskSpace(): Promise<{
        used: number;
        free: number;
        total: number;
    }>;
}
export type FileSystemIn = string | File | FileSystemSyncAccessHandle;
export type FileSystemOut = File | FileSystemSyncAccessHandle;
export interface PickDirectoryOptions {
    /** By specifying an ID, the browser can remember different directories for different IDs. If the same ID is used for another picker, the picker opens in the same directory. */
    id?: string;
    /** The mode of the file system access handle to be created. */
    mode?: 'read' | 'readwrite';
    /** A FileSystemHandle or a well known directory ("desktop", "documents", "downloads", "music", "pictures", or "videos") to open the dialog in. */
    startIn?: DirectoryStartIn;
}
export interface PickFilesOptions extends PickDirectoryOptions {
    /** By default the picker should include an option to not apply any file type filters (instigated with the type option below). Setting this option to true means that option is not available. */
    excludeAcceptAllOption?: boolean;
    /** When set to true multiple files may be selected. */
    multiple?: boolean;
    /** An Array of allowed file types to pick. Each item is an object with the following options: */
    types?: {
        /** An optional description of the category of files types allowed. Defaults to an empty string. */
        description?: string;
        /** An object with the keys set to the MIME type and the values an Array of file extensions (see below for an example). */
        accept: {
            [mimetype: string]: string[];
        };
    }[];
}
export type DirectoryStartIn = 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
