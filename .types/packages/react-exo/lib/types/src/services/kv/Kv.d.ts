import { KVBase, KVDatabase } from './Kv.interface';
export declare class KVService implements KVBase {
    init(id: string, version: number): KVDatabase;
}
