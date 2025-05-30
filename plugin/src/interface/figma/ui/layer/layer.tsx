import styles from './layer.module.css';

import {useCallback} from 'react';
import {createClassName} from '../../lib/create-class-name.js';
import {createComponent} from '../../lib/create-component.js';
import {noop} from '../../lib/no-op.js';

import type {ReactNode} from 'react';
import type {Event, EventHandler} from '../../types/event-handler.js';
import type {FocusableComponentProps} from '../../types/focusable-component-props.js';

export interface LayerProps extends FocusableComponentProps<HTMLInputElement> {
  value: boolean,
  icon: ReactNode,
  children: ReactNode,
  description?: string,
  component?: boolean,
  bold?: boolean,
  onChange?: EventHandler.onChange<HTMLInputElement>,
  onValueChange?: EventHandler.onValueChange<boolean>,
}

export const Layer = createComponent<HTMLInputElement, LayerProps>(({
  value,
  icon,
  children,
  description,
  bold = false,
  component = false,
  onChange = noop,
  onKeyDown = noop,
  onValueChange = noop,
  propagateEscapeKeyDown = true,
  ...rest
}, ref) => {

  const handleChange = useCallback((e: Event.onChange<HTMLInputElement>) => {
    onChange(e);
    const newValue = e.currentTarget.checked;
    onValueChange(newValue);
  }, [onChange, onValueChange])

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
        styles.layer,
        bold ? styles.bold : null,
        component ? styles.component : null
      ])}>
      <input
        {...rest}
        ref={ref}
        type="checkbox"
        checked={value}
        className={styles.input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      />
      <div className={styles.box}/>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.children}>{children}</div>
      {typeof description === 'undefined'
        ? null
        : <div className={styles.description}>{description}</div>
      }
    </label>
  );
});
