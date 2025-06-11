import {Icon, type IconProps} from '../Icon';

export function IconAdjust(props: IconProps) {
  return (
    <Icon
      {...props}
      size={24}
      path="M7 7h3v3H7zM6 7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm1 7h3v3H7zm-1 0a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm11-7h-3v3h3zm-3-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zm0 8h3v3h-3zm-1 0a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1z"
    />
  );
}
