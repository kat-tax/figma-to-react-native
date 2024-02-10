import styles from './icon-toggle-button.module.css';

import {useCallback} from 'react';
import {createClassName} from '../../utilities/create-class-name.js';
import {createComponent} from '../../utilities/create-component.js';
import {noop} from '../../utilities/no-op.js';

import type {ReactNode} from 'react';
import type {Event, EventHandler} from '../../types/event-handler.js';
import type {FocusableComponentProps} from '../../types/focusable-component-props.js';

export interface IconToggleButtonProps extends FocusableComponentProps<HTMLInputElement> {
  value: boolean,
  children: ReactNode,
  disabled?: boolean,
  onChange?: EventHandler.onChange<HTMLInputElement>,
  onValueChange?: EventHandler.onValueChange<boolean>,
}

export const IconToggleButton = createComponent<HTMLInputElement, IconToggleButtonProps>(({
  value,
  children,
  disabled = false,
  onChange = noop,
  onKeyDown = noop,
  onValueChange = noop,
  propagateEscapeKeyDown = true,
  ...rest
}, ref) => {

  const handleChange = useCallback((e: Event.onChange<HTMLInputElement>) => {
    onChange(e);
    onValueChange(e.currentTarget.checked);
  }, [onChange, onValueChange]);

  const handleKeyDown = useCallback((e: Event.onKeyDown<HTMLInputElement>) => {
    onKeyDown(e);
    if (e.key === 'Escape') {
      if (propagateEscapeKeyDown === false)
        e.stopPropagation();
      e.currentTarget.blur();
    }
  }, [onKeyDown, propagateEscapeKeyDown]);

  return (
    <label
      className={createClassName([
        styles.iconToggleButton,
        disabled ? styles.disabled : null
      ])}>
      <input
        {...rest}
        ref={ref}
        type="checkbox"
        checked={value}
        className={styles.input}
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      />
      <div className={styles.box}>
        <div className={styles.icon}>{children}</div>
      </div>
    </label>
  );
});
