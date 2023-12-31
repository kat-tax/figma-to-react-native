import styles from './vertical-space.module.css';
import {createComponent} from '../../utilities/create-component.js';
import type {Space} from '../../types/space.js';

export type VerticalSpaceProps = {
  space: VerticalSpaceSpace,
}

export type VerticalSpaceSpace = Space;

export const VerticalSpace = createComponent<HTMLDivElement, VerticalSpaceProps>(
  ({space, ...rest}, ref) => (
    <div {...rest} ref={ref} className={styles[space]}/>
  )
);
