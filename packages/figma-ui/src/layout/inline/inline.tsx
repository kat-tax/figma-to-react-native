import styles from './inline.module.css';

import {Children} from 'react';
import {createClassName} from '../../utilities/create-class-name';
import {createComponent} from '../../utilities/create-component.js';

import type {ReactNode} from 'react';
import type {Space} from '../../types/space.js'

export type InlineProps = {
  children: ReactNode,
  space?: InlineSpace,
}

export type InlineSpace = Space;

export const Inline = createComponent<HTMLDivElement, InlineProps>(({
  space,
  children,
  className,
  ...rest
}, ref) => (
  <div
    {...rest}
    ref={ref}
    className={createClassName([
      className || null,
      (typeof space === 'undefined' ? undefined : styles[space]) || null,
    ])}>
    {Children.toArray(children).map((child: ReactNode, i: number) => (
      <div key={i} className={styles.child}>
        {child}
      </div>
    ))}
  </div>
));
