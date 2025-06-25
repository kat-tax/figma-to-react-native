import {Icon, type IconProps} from '../Icon';

export function IconList(props: IconProps) {
  return (
    <Icon
      {...props}
      size={24}
      path="M6.5 6.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0m4-.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 10a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0-5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm-4 .5a1 1 0 1 1 2 0 1 1 0 0 1-2 0m1 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
    />
  );
}
