import styles from './loading-indicator.module.css';
import {createComponent} from '../../lib/create-component.js';
import type {IconColor} from '../../types/colors.js';

export type LoadingIndicatorProps = {
  color?: IconColor,
}

export const LoadingIndicator = createComponent<HTMLDivElement, LoadingIndicatorProps>(
  ({color, ...rest}, ref) => (
    <div {...rest} ref={ref} className={styles.loadingIndicator}>
      <svg className={styles.svg} style={
        typeof color === 'undefined'
          ? undefined
          : {fill: `var(--figma-color-icon-${color})`}
        }>
        <path d="M8 15C11.866 15 15 11.866 15 8C15 6.7865 14.6912 5.64511 14.1479 4.65013L15.0263 4.17174C15.6471 5.30882 16 6.6132 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 5.54138 1.10909 3.34181 2.85426 1.8743L3.47761 2.65678C1.96204 3.94081 1 5.85806 1 8C1 11.866 4.13401 15 8 15Z"/>
      </svg>
    </div>
  )
);
