import {Icon, type IconProps} from 'interface/figma/icons/Icon';

export function IconSupport(props: IconProps) {
  return (
    <Icon
      {...props}
      size={24}
      path="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13v6l5.25 3.15.75-1.23-4.5-2.7V7zm6.5 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"
    />
  );
}
