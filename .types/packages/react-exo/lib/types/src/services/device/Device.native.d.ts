import { DeviceBase } from './Device.interface';
export declare class DeviceService implements DeviceBase {
    share({ url, title }: {
        url?: string;
        title?: string;
    }): Promise<boolean>;
    isOnline(): Promise<boolean>;
    suscribeOnline(update: (isOnline: boolean) => void): import('@react-native-community/netinfo').NetInfoSubscription;
    getLocale(): string;
}
