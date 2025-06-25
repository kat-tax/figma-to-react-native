import {Icon, type IconProps} from '../Icon';

export function IconAnimation(props: IconProps) {
  return (
    <Icon
      {...props}
      size={24}
      path="M8 7h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1M6 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm4.996 1.132A1 1 0 0 0 9.5 10v4a1 1 0 0 0 1.496.868l3.5-2a1 1 0 0 0 0-1.736zm.504 4.297-1 .571v-4l1 .571 1.492.853L14 12l-1.008.576z"
    />
  );
}
