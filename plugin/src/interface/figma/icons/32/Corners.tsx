import {Icon, type IconProps} from '../Icon';

export function IconCorners(props: IconProps) {
  return (
    <Icon
      {...props}
      size={32}
      path="M11 11H11.5H14V12H12V14H11V11.5V11ZM18 11H20.5H21V11.5V14H20V12H18V11ZM12 20V18H11V20.5V21H11.5H14V20H12ZM21 18V20.5V21H20.5H18V20H20V18H21Z"
    />
  );
}
