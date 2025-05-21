import {Icon, type IconProps} from '../Icon';

export function IconAnimation(props: IconProps) {
  return (
    <Icon
      {...props}
      size={32}
      path="M10 10H22V22H10V10ZM9 10C9 9.44772 9.44772 9 10 9H22C22.5523 9 23 9.44772 23 10V22C23 22.5523 22.5523 23 22 23H10C9.44772 23 9 22.5523 9 22V10ZM19 16L14 13V19L19 16Z"
    />
  );
}
