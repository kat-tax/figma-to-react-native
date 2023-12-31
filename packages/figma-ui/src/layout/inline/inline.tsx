import styles from './inline.module.css';

import {toChildArray} from 'preact';
import {createComponent} from '../../utilities/create-component.js';

import type {ReactNode} from 'react';
import type {Space} from '../../types/space.js'

export type InlineProps = {
  children: ReactNode,
  space?: InlineSpace,
}

export type InlineSpace = Space;

export const Inline = createComponent<HTMLDivElement, InlineProps>(({
  children,
  space,
  ...rest
}, ref) => (
  <div {...rest} ref={ref} className={typeof space === 'undefined' ? undefined : styles[space]}>
    {toChildArray(children).map((child: ReactNode, i: number) => (
      <div key={i} className={styles.child}>
        {child}
      </div>
    ))}
  </div>
));
