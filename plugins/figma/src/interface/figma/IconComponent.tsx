interface IconComponentProps {
  warning?: boolean;
}

export function IconComponent({warning = false}: IconComponentProps) {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16">
      <path
        fill={warning ? 'var(--figma-color-icon-warning)' : 'var(--figma-color-icon-component)'}
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8 5.838 6.66 4.5 8 3.162 9.34 4.5zm-.43-3.66L5.68 4.066a.613.613 0 0 0 0 .868l1.89 1.888a.61.61 0 0 0 .86 0l1.89-1.888a.613.613 0 0 0 0-.868L8.43 2.178a.61.61 0 0 0-.86 0M10.161 8 11.5 6.66 12.838 8 11.5 9.34zm-.984.43 1.888 1.89c.24.24.628.24.868 0l1.888-1.89a.61.61 0 0 0 0-.86l-1.888-1.89a.613.613 0 0 0-.868 0L9.178 7.57a.61.61 0 0 0 0 .86M6.66 11.5 8 12.838 9.34 11.5 8 10.162zm-.98-.434 1.89-1.888a.61.61 0 0 1 .86 0l1.89 1.888c.24.24.24.628 0 .868l-1.89 1.888a.61.61 0 0 1-.86 0l-1.89-1.888a.613.613 0 0 1 0-.868M3.162 8 4.5 6.66 5.838 8 4.5 9.34zm-.984.43 1.888 1.89c.24.24.628.24.868 0l1.888-1.89a.61.61 0 0 0 0-.86L4.934 5.68a.613.613 0 0 0-.868 0L2.178 7.57a.61.61 0 0 0 0 .86">
      </path>
    </svg>
  );
}

