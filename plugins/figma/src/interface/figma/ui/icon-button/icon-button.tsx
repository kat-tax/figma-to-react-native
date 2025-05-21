import styles from './icon-button.module.css';

import {useCallback} from 'react';
import {createComponent} from '../../lib/create-component.js';
import {noop} from '../../lib/no-op.js';

import type {ReactNode} from 'react';
import type {Event, EventHandler} from '../../types/event-handler.js';
import type {FocusableComponentProps} from '../../types/focusable-component-props.js';

export interface IconButtonProps extends FocusableComponentProps<HTMLButtonElement> {
  children: ReactNode,
  disabled?: boolean,
  onClick?: EventHandler.onClick<HTMLButtonElement>,
}

export const IconButton = createComponent<HTMLButtonElement, IconButtonProps>(({
  children,
  onClick,
  onKeyDown = noop,
  disabled = false,
  propagateEscapeKeyDown = true,
  ...rest
}, ref) => {

  const handleKeyDown = useCallback((e: Event.onKeyDown<HTMLButtonElement>) => {
    onKeyDown(e)
    if (e.key === 'Escape') {
      if (propagateEscapeKeyDown === false)
        e.stopPropagation();
      e.currentTarget.blur();
    }
  }, [onKeyDown, propagateEscapeKeyDown]);

  return (
    <button
      {...rest}
      ref={ref}
      className={styles.iconButton}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      tabIndex={0}>
      <div className={styles.icon}>{children}</div>
    </button>
  );
});
