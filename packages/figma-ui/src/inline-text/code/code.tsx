import {h} from 'preact'
import {createComponent} from '../../utilities/create-component';
import styles from './code.module.css';

import type {ComponentChildren} from 'preact';

export type CodeProps = {
  children: ComponentChildren,
}

export const Code = createComponent<HTMLSpanElement, CodeProps>(({children, ...rest}, ref) => {
  return (
    <code {...rest} ref={ref} class={styles.code}>
      {children}
    </code>
  )
})
