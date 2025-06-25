import {Icon, type IconProps} from '../Icon';

export function IconCross(props: IconProps) {
  return (
    <Icon
      {...props}
      size={24}
      path="M7.146 7.146a.5.5 0 0 1 .708 0L12 11.293l4.146-4.147a.5.5 0 0 1 .708.708L12.707 12l4.147 4.146a.5.5 0 0 1-.708.708L12 12.707l-4.146 4.147a.5.5 0 0 1-.708-.708L11.293 12 7.146 7.854a.5.5 0 0 1 0-.708"
    />
  );
}
