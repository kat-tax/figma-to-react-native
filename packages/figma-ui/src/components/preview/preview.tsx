import style from './preview.module.css';
import {createComponent} from '../../utilities/create-component.js';
import type {ReactNode} from 'react';

export type PreviewProps = {
  children: ReactNode,
}

export const Preview = createComponent<HTMLDivElement, PreviewProps>(({
  children,
  ...rest
}, ref) => (
  <div {...rest} ref={ref} className={style.preview}>
    {children}
  </div>
));
