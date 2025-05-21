import styles from './vertical-space.module.css';
import {createClassName} from '../../lib/create-class-name';
import {createComponent} from '../../lib/create-component.js';
import type {Space} from '../../types/space.js';

export type VerticalSpaceProps = {
  space: VerticalSpaceSpace,
}

export type VerticalSpaceSpace = Space;

export const VerticalSpace = createComponent<HTMLDivElement, VerticalSpaceProps>(
  ({space, className, ...rest}, ref) => (
    <div
      {...rest}
      ref={ref}
      className={createClassName([className || null ,styles[space]])}
    />
  )
);
