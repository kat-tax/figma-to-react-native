import styles from './selectable-item.module.css';

import {useCallback} from 'react';
import {createClassName} from '../../utilities/create-class-name.js';
import {createComponent} from '../../utilities/create-component.js';
import {IconMenuCheckmarkChecked16} from '../../icons/icon-16/icon-menu-checkmark-checked-16.js';
import {noop} from '../../utilities/no-op.js';

import {ReactNode} from 'react';
import {Event, EventHandler} from '../../types/event-handler.js';
import {FocusableComponentProps} from '../../types/focusable-component-props.js';

export interface SelectableItemProps extends FocusableComponentProps<HTMLInputElement> {
  value: boolean,
  children: ReactNode,
  disabled?: boolean,
  indent?: boolean,
  bold?: boolean,
  onChange?: EventHandler.onChange<HTMLInputElement>,
  onValueChange?: EventHandler.onValueChange<boolean>,
}

export const SelectableItem = createComponent<HTMLInputElement, SelectableItemProps>(({
  value,
  children,
  disabled = false,
  indent = false,
  bold = false,
  onChange = noop,
  onKeyDown = noop,
  onValueChange = noop,
  propagateEscapeKeyDown = true,
  ...rest
}, ref) => {

  const handleChange = useCallback((event: Event.onChange<HTMLInputElement>) => {
    onChange(event);
    onValueChange(event.currentTarget.checked);
  }, [onChange, onValueChange]);

  const handleKeyDown = useCallback((event: Event.onKeyDown<HTMLInputElement>) => {
    onKeyDown(event);
    if (event.key === 'Escape') {
      if (propagateEscapeKeyDown === false)
        event.stopPropagation();
      event.currentTarget.blur();
    }
  }, [onKeyDown, propagateEscapeKeyDown]);

  return (
    <label
      className={createClassName([
        styles.selectableItem,
        disabled ? styles.disabled : null,
        bold ? styles.bold : null,
        indent ? styles.indent : null
      ])}>
      <input
        {...rest}
        ref={ref}
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={disabled ? undefined : handleKeyDown}
        className={styles.input}
        tabIndex={0}
      />
      <div className={styles.box} />
      <div className={styles.children}>{children}</div>
      {value
        ? <div className={styles.icon}>
            <IconMenuCheckmarkChecked16 />
          </div>
        : null
      }
    </label>
  )
})
