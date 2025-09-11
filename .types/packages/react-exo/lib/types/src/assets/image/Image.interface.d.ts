import { ImageStyle, DimensionValue } from 'react-native';
export type ImageComponent = (props: ImageProps) => JSX.Element;
export interface ImageProps {
    /** Callback for when the image loads successfully */
    onSuccess?: (result: {
        nativeEvent: {
            width: number;
            height: number;
            source: string;
        };
    }) => void;
    /** Callback for when an error occurs */
    onError?: (result: {
        nativeEvent: {
            error: string;
        };
    }) => void;
    /** URL of the image */
    url: string;
    /** Width of the image */
    width?: DimensionValue;
    /** Height of the image */
    height?: DimensionValue;
    /** Style of the image */
    style?: ImageStyle | undefined;
    /** Whether the image is draggable (web only) */
    draggable?: boolean;
    /** A base64 encoded thumbhash of the image */
    thumbhash?: string;
    /** A base64 encoded image to show when the image fails to load */
    failureImage?: string;
    /** Resize mode of the image */
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
    /** Duration of the transition animation in seconds. Defaults = 0.75 */
    transitionDuration?: number;
    /** Show activity indicator while loading, overrides placeholder. Default = false */
    showActivityIndicator?: boolean;
    /** Enable progressive loading, defaults to false */
    progressiveLoadingEnabled?: boolean;
    /** Border radius of the image */
    borderRadius?: number;
    /** Caching policy:
     * - `discWithCacheControl` - caches the image in the disc and uses the cache control headers.
     * - `discNoCacheControl` - will cache the image in the disc and never re-fetch it.
     * - `memory` - uses the default platform caching policy with no explicit saving to disk.
     * @default memory
     */
    cachePolicy?: 'memory' | 'discWithCacheControl' | 'discNoCacheControl';
    /** The identifier used for testing */
    testID?: string;
}
