export interface DeviceBase {
    share({ url, title, files }: {
        url?: string;
        title?: string;
        files?: File[];
    }): void;
    isOnline(): Promise<boolean>;
    suscribeOnline(update: (isOnline: boolean) => void): () => void;
    getLocale(): string;
}
