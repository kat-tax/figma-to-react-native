import {Icon, type IconProps} from 'interface/figma/icons/Icon';

export function IconExport(props: IconProps) {
  return (
    <Icon
      {...props}
      size={24}
      path="M12 2a1 1 0 0 1 1 1v5.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L11 8.586V3a1 1 0 0 1 1-1zM4 14a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4zm2 1v3h12v-3H6z"
    />
  );
}
