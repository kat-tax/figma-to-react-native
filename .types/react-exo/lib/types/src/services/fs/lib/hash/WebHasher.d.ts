import { FileSystemIn } from '../../Fs.interface';
declare function start(input: FileSystemIn, progress?: (bytes: number, total: number) => void, jobId?: number): Promise<string>;
declare function cancel(jobId: number): Promise<void>;
declare const _default: {
    start: typeof start;
    cancel: typeof cancel;
};
export default _default;
