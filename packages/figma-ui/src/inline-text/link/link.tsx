import {h} from 'preact';
import {useCallback} from 'preact/hooks';
import {createClassName} from '../../utilities/create-class-name';
import {createComponent} from '../../utilities/create-component';
import {noop} from '../../utilities/no-op';
import styles from './link.module.css';

import type {ComponentChildren} from 'preact';
import type {FocusableComponentProps} from '../../types/focusable-component-props';
import type {Event} from '../../types/event-handler'

export interface LinkProps extends FocusableComponentProps<HTMLAnchorElement> {
  children: ComponentChildren,
  href: string,
  target?: string,
  fullWidth?: boolean,
}

export const Link = createComponent<HTMLAnchorElement, LinkProps>((
  {
    children,
    fullWidth = false,
    href,
    onKeyDown = noop,
    propagateEscapeKeyDown = true,
    target,
    ...rest
  },
  ref
) => {
  const handleKeyDown = useCallback(
    function (event: Event.onKeyDown<HTMLAnchorElement>) {
      onKeyDown(event)
      if (event.key === 'Escape') {
        if (propagateEscapeKeyDown === false) {
          event.stopPropagation();
        }
        event.currentTarget.blur();
      }
    },
    [propagateEscapeKeyDown, onKeyDown],
  );

  return (
    <a
      {...rest}
      ref={ref}
      href={href}
      target={target}
      tabIndex={0}
      class={createClassName([styles.link, fullWidth === true ? styles.fullWidth : null])}
      onKeyDown={handleKeyDown}>
      {children}
    </a>
  );
});
