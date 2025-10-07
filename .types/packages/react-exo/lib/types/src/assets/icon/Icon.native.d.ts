import { IconComponent, IconProps } from './Icon.base';
import { FullExtendedIconifyIcon } from '@iconify/utils';
export type IconRuntimeProps = IconProps & {
    iconData: FullExtendedIconifyIcon;
    hasPlugin: boolean;
};
export declare const Icon: Omit<IconComponent, 'Remote' | 'New'>;
