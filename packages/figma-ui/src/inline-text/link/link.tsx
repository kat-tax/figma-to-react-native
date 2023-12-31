import styles from './link.module.css';

import {useCallback} from 'react';
import {createClassName} from '../../utilities/create-class-name';
import {createComponent} from '../../utilities/create-component';
import {noop} from '../../utilities/no-op';

import type {ReactNode} from 'react';
import type {FocusableComponentProps} from '../../types/focusable-component-props';
import type {Event} from '../../types/event-handler';

export interface LinkProps extends FocusableComponentProps<HTMLAnchorElement> {
  children: ReactNode,
  href: string,
  target?: string,
  fullWidth?: boolean,
}

export const Link = createComponent<HTMLAnchorElement, LinkProps>(({
  href,
  target,
  children,
  fullWidth = false,
  onKeyDown = noop,
  propagateEscapeKeyDown = true,
  ...rest
}, ref) => {

  const handleKeyDown = useCallback((e: Event.onKeyDown<HTMLAnchorElement>) => {
    onKeyDown(e);
    if (e.key === 'Escape') {
      if (propagateEscapeKeyDown === false) {
        e.stopPropagation();
      }
      e.currentTarget.blur();
    }
  }, [propagateEscapeKeyDown, onKeyDown]);

  return (
    <a
      {...rest}
      ref={ref}
      href={href}
      target={target}
      onKeyDown={handleKeyDown}
      className={createClassName([styles.link, fullWidth ? styles.fullWidth : null])}
      tabIndex={0}>
      {children}
    </a>
  );
});
