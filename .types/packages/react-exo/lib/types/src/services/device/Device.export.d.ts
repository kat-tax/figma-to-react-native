import { DeviceService } from './Device';
export type * from './Device.interface';
export declare const Device: DeviceService;
export declare const share: ({ url, title, files }: {
    url?: string;
    title?: string;
    files?: File[];
}) => Promise<boolean>;
export declare const isOnline: () => Promise<boolean>;
export declare const suscribeOnline: (update: (isOnline: boolean) => void) => () => void;
export declare const getLocale: () => string;
