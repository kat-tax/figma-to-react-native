import { ReactVideoProps as VideoBaseProps } from 'react-native-video';
export type VideoComponent = React.ForwardRefExoticComponent<Omit<VideoProps, "ref"> & React.RefAttributes<VideoRef>>;
export interface VideoProps extends VideoBaseProps {
    ref?: React.Ref<VideoRef>;
    title?: string;
    thumbnails?: string;
}
export interface VideoRef {
    play: () => Promise<void>;
    pause: () => Promise<void>;
    seek: (time: number, tolerance?: number) => void;
    mute: (state: boolean) => void;
    setVolume: (volume: number) => void;
    getDuration: () => Promise<number>;
    getCurrentTime: () => Promise<number>;
    presentFullscreen: () => void;
    dismissFullscreen: () => void;
    restoreUIForPictureInPicture?: (restore: boolean) => void;
}
