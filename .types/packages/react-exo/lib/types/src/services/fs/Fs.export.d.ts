import { FSService } from './Fs';
export type * from './Fs.interface';
export * as web from './lib/utils/web';
export * as posix from './lib/core/posix';
export declare const FS: FSService;
export declare const watch: (path: string, callback: (records: unknown[]) => void) => Promise<false | (() => void)>;
export declare const pick: (options?: import('./Fs.interface').PickFilesOptions) => Promise<File[]>;
export declare const pickDirectory: (options?: import('./Fs.interface').PickDirectoryOptions) => Promise<File[]>;
export declare const hash: (input: import('./Fs.interface').FileSystemIn, progress?: (bytes: number, total: number) => void, jobId?: number) => Promise<string>;
export declare const cancelHash: (jobId: number) => Promise<void>;
export declare const isTextFile: (name: string, buffer?: ArrayBuffer) => Promise<boolean | null>;
export declare const importFiles: (path: string, files: Array<File>) => Promise<void>;
export declare const getDiskSpace: () => Promise<{
    total: number;
    used: number;
    free: number;
}>;
