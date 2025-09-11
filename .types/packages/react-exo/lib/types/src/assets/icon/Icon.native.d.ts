import { IconComponent, IconProps } from './Icon.interface';
import { FullExtendedIconifyIcon } from '@iconify/utils';
export type IconRuntimeProps = IconProps & {
    iconData: FullExtendedIconifyIcon;
    hasPlugin: boolean;
};
export declare const Icon: IconComponent;
