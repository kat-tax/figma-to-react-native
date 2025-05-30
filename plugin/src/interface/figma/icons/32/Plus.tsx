import {Icon, type IconProps} from '../Icon';

export function IconPlus(props: IconProps) {
  return (
    <Icon
      {...props}
      size={32}
      path="M15.5 15.5V10.5H16.5V15.5H21.5V16.5H16.5V21.5H15.5V16.5H10.5V15.5H15.5Z"
    />
  );
}
