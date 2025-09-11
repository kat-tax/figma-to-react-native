import { FSBase, FileSystemIn, HfsType, PickFilesOptions, PickDirectoryOptions } from './Fs.interface';
import { HfsImpl } from './lib/core/hfs.types';
export declare class FSService implements FSBase {
    init(backend?: HfsType, token?: string): Promise<HfsImpl>;
    pick(options?: PickFilesOptions): Promise<File[]>;
    pickDirectory(options?: PickDirectoryOptions): Promise<File[]>;
    hash(input: FileSystemIn, progress?: (bytes: number, total: number) => void, jobId?: number): Promise<string>;
    cancelHash(jobId: number): Promise<void>;
    isTextFile(name: string, buffer?: ArrayBuffer): Promise<boolean | null>;
    importFiles(path: string, files: Array<File>): Promise<void>;
    getDiskSpace(): Promise<{
        total: number;
        used: number;
        free: number;
    }>;
    watch(path: string, callback: (records: unknown[]) => void): Promise<false | (() => void)>;
}
