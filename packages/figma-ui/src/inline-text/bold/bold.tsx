import {h} from 'preact';
import {createComponent} from '../../utilities/create-component';
import styles from './bold.module.css';

import type {ComponentChildren} from 'preact';

export type BoldProps = {
  children: ComponentChildren
}

export const Bold = createComponent<HTMLSpanElement, BoldProps>(({children, ...rest}, ref) => {
  return (
    <strong {...rest} ref={ref} class={styles.bold}>
      {children}
    </strong>
  )
})
