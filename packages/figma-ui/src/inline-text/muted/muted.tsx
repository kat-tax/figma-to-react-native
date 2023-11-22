import {h} from 'preact';
import {createComponent} from '../../utilities/create-component';
import styles from './muted.module.css';

import type {ComponentChildren} from 'preact';

export type MutedProps = {
  children: ComponentChildren,
}

export const Muted = createComponent<HTMLSpanElement, MutedProps>(({children, ...rest}, ref) => {
  return (
    <span {...rest} ref={ref} class={styles.muted}>
      {children}
    </span>
  );
});
