import styles from './icon.module.css';
import {createComponent} from '../utilities/create-component.js';
import type {IconColor} from '../types/colors.js';

export type IconProps = {
  color?: IconColor,
}

export function createIcon(path: string, options: {width: number; height: number}) {
  const {width, height} = options;
  return createComponent<SVGSVGElement, IconProps>(({color, ...rest}) => (
    <svg
      {...rest}
      width={width}
      height={height}
      className={styles.icon}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        fill:
          typeof color === 'undefined'
            ? 'currentColor'
            : `var(--figma-color-icon-${color})`
      }}>
      <path clipRule="evenodd" d={path} fillRule="evenodd"/>
    </svg>
  ));
}
