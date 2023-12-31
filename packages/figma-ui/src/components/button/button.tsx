import styles from './button.module.css';

import {useCallback} from 'react';
import {LoadingIndicator} from '../loading-indicator/loading-indicator.js';
import {createClassName} from '../../utilities/create-class-name.js';
import {createComponent} from '../../utilities/create-component.js';
import {noop} from '../../utilities/no-op.js';

import type {ReactNode} from 'react';
import type {Event, EventHandler} from '../../types/event-handler.js';
import type {FocusableComponentProps} from '../../types/focusable-component-props.js';

export interface ButtonProps extends FocusableComponentProps<HTMLButtonElement> {
  children: ReactNode,
  secondary?: boolean,
  loading?: boolean,
  danger?: boolean,
  disabled?: boolean,
  fullWidth?: boolean,
  onClick?: EventHandler.onClick<HTMLButtonElement>,
}

export const Button = createComponent<HTMLButtonElement, ButtonProps>(({
  children,
  secondary = false,
  loading = false,
  danger = false,
  disabled = false,
  fullWidth = false,
  onClick = noop,
  onKeyDown = noop,
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
    <div
      className={createClassName([
        styles.button,
        danger ? styles.danger : null,
        secondary ? styles.secondary : styles.initial,
        fullWidth ? styles.fullWidth : null,
        disabled ? styles.disabled : null,
        loading ? styles.loading : null,
      ])}>
      {loading
        ? <div className={styles.loadingIndicator}>
            <LoadingIndicator/>
          </div>
        : null
      }
      <button
        {...rest}
        ref={ref}
        disabled={disabled}
        onClick={loading ? undefined : onClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}>
        <div className={styles.children}>{children}</div>
      </button>
    </div>
  )
})
