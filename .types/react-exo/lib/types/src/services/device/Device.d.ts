import { DeviceBase } from './Device.interface';
export declare class DeviceService implements DeviceBase {
    share({ url, title, files }: {
        url?: string;
        title?: string;
        files?: File[];
    }): Promise<boolean>;
    isOnline(): Promise<boolean>;
    suscribeOnline(update: (isOnline: boolean) => void): () => void;
    getLocale(): string;
}
