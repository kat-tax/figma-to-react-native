import styles from './banner.module.css';
import {createClassName} from '../../utilities/create-class-name.js';
import {createComponent} from '../../utilities/create-component.js';
import type {ReactNode} from 'react';

export type BannerProps = {
  icon: ReactNode,
  children: ReactNode,
  variant?: BannerVariant,
}

export type BannerVariant = 'success' | 'warning';

export const Banner = createComponent<HTMLDivElement, BannerProps>(
  ({
    children,
    icon,
    variant,
    ...rest
  }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={createClassName([
        styles.banner,
        typeof variant === 'undefined' ? null : styles[variant],
      ])}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.children}>{children}</div>
    </div>
  )
);
