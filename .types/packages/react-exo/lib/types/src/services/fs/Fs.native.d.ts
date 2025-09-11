import { FSBase, FileSystemIn, HfsType, PickFilesOptions, PickDirectoryOptions } from './Fs.interface';
import { HfsImpl } from './lib/core/hfs.types';
export declare class FSService implements FSBase {
    init(backend?: HfsType, token?: string): Promise<HfsImpl>;
    watch(_path: string, _callback: (records: unknown[]) => void): Promise<() => void>;
    pick(_options?: PickFilesOptions): Promise<never[]>;
    pickDirectory(_options?: PickDirectoryOptions): Promise<never[]>;
    hash(input: FileSystemIn, _progress?: (bytes: number, total: number) => void, _jobId?: number): Promise<string>;
    cancelHash(jobId: number): Promise<void>;
    isTextFile(name: string, buffer?: ArrayBuffer): Promise<boolean | null>;
    importFiles(_path: string, _files: Array<File>): Promise<void>;
    getDiskSpace(): Promise<{
        total: number;
        free: number;
        used: number;
    }>;
}
