export interface IconProps {
  color?: IconColor | 'currentColor';
  size?: number;
  path?: string;
}

export type IconColor =
  | 'brand'
  | 'brand-pressed'
  | 'brand-secondary'
  | 'brand-tertiary'
  | 'component'
  | 'component-pressed'
  | 'component-secondary'
  | 'component-tertiary'
  | 'danger'
  | 'danger-hover'
  | 'danger-pressed'
  | 'danger-secondary'
  | 'danger-secondary-hover'
  | 'danger-tertiary'
  | 'default'
  | 'disabled'
  | 'hover'
  | 'onbrand'
  | 'onbrand-secondary'
  | 'onbrand-tertiary'
  | 'oncomponent'
  | 'oncomponent-secondary'
  | 'oncomponent-tertiary'
  | 'ondanger'
  | 'ondanger-secondary'
  | 'ondanger-tertiary'
  | 'ondisabled'
  | 'oninverse'
  | 'onselected'
  | 'onselected-secondary'
  | 'onselected-strong'
  | 'onselected-tertiary'
  | 'onsuccess'
  | 'onsuccess-secondary'
  | 'onsuccess-tertiary'
  | 'onwarning'
  | 'onwarning-secondary'
  | 'onwarning-tertiary'
  | 'pressed'
  | 'secondary'
  | 'secondary-hover'
  | 'selected'
  | 'selected-secondary'
  | 'selected-tertiary'
  | 'success'
  | 'success-pressed'
  | 'success-secondary'
  | 'success-tertiary'
  | 'tertiary'
  | 'tertiary-hover'
  | 'warning'
  | 'warning-pressed'
  | 'warning-secondary'
  | 'warning-tertiary'

export function Icon({color = 'currentColor', size = 16, path}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      viewBox={`0 0 ${size} ${size}`}>
      <path
        fill={color === 'currentColor' ? 'currentColor' : `var(--figma-color-icon-${color})`}
        fillRule="evenodd"
        clipRule="evenodd"
        d={path}
      />
    </svg>
  );
}
