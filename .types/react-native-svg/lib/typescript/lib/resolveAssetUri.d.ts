import { ImageResolvedAssetSource, type ImageProps as RNImageProps } from 'react-native';
export type PackagerAsset = {
    __packager_asset: boolean;
    fileSystemLocation: string;
    httpServerLocation: string;
    width?: number;
    height?: number;
    scales: Array<number>;
    hash: string;
    name: string;
    type: string;
};
export declare function resolveAssetUri(source?: RNImageProps['source'] | string | number): Partial<ImageResolvedAssetSource> | null;
//# sourceMappingURL=resolveAssetUri.d.ts.map