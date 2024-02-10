import styles from './checkbox.module.css';

import {useCallback} from 'react';
import {IconControlCheckboxChecked12} from '../../icons/icon-12/icon-control-checkbox-checked-12.js';
import {createClassName} from '../../utilities/create-class-name.js';
import {createComponent} from '../../utilities/create-component.js';
import {noop} from '../../utilities/no-op.js';

import type {ReactNode} from 'react';
import type {Event, EventHandler} from '../../types/event-handler.js';
import type {FocusableComponentProps} from '../../types/focusable-component-props.js';

export interface CheckboxProps extends FocusableComponentProps<HTMLInputElement> {
  value: boolean,
  children: ReactNode,
  disabled?: boolean,
  onChange?: EventHandler.onChange<HTMLInputElement>,
  onValueChange?: EventHandler.onValueChange<boolean>,
}

export const Checkbox = createComponent<HTMLInputElement, CheckboxProps>(({
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
          styles.checkbox,
          disabled ? styles.disabled : null
        ])}>
        <input
          {...rest}
          ref={ref}
          type="checkbox"
          checked={value}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={styles.input}
          tabIndex={0}
        />
        <div className={styles.fill}>
          {value
            ? <div className={styles.checkIcon}>
                <IconControlCheckboxChecked12/>
              </div>
            : null
          }
        </div>
        <div className={styles.border}/>
        <div className={styles.children}>{children}</div>
      </label>
    )
  }
)
