import {Icon, type IconProps} from '../Icon';

export function IconEllipsis(props: IconProps) {
  return (
    <Icon
      {...props}
      size={24}
      path="M7 11.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m6 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m4.5 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
    />
  );
}
