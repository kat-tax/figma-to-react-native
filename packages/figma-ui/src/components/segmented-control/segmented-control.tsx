import styles from './segmented-control.module.css';

import {useCallback} from 'react';
import {ITEM_ID_DATA_ATTRIBUTE_NAME} from '../../utilities/private/constants.js';
import {createClassName} from '../../utilities/create-class-name.js';
import {createComponent} from '../../utilities/create-component.js';
import {noop} from '../../utilities/no-op.js';

import type {ReactNode} from 'react';
import type {Event, EventHandler} from '../../types/event-handler.js';
import type {FocusableComponentProps} from '../../types/focusable-component-props.js';

export interface SegmentedControlProps extends FocusableComponentProps<HTMLInputElement> {
  value: string,
  options: Array<SegmentedControlOption>,
  disabled?: boolean,
  onChange?: EventHandler.onChange<HTMLInputElement>,
  onValueChange?: EventHandler.onValueChange<string>,
}

export type SegmentedControlOption = {
  value: string,
  disabled?: boolean,
  children?: ReactNode,
}

export const SegmentedControl = createComponent<HTMLInputElement, SegmentedControlProps>(({
  value,
  options,
  disabled = false,
  onChange = noop,
  onKeyDown = noop,
  onValueChange = noop,
  propagateEscapeKeyDown = true,
  ...rest
}) => {

  const handleChange = useCallback((e: Event.onChange<HTMLInputElement>) => {
    onChange(e);
    const id = e.currentTarget.getAttribute(ITEM_ID_DATA_ATTRIBUTE_NAME);
    if (id === null)
      throw new Error('`id` is `null`');
    onValueChange(options[parseInt(id, 10)].value);
  }, [onChange, onValueChange, options]);

  const handleKeyDown = useCallback((e: Event.onKeyDown<HTMLInputElement>) => {
    onKeyDown(e);
    if (e.key === 'Escape') {
      if (propagateEscapeKeyDown === false)
        e.stopPropagation();
      e.currentTarget.blur();
    }
  }, [onKeyDown, propagateEscapeKeyDown]);

  return (
    <div
      className={createClassName([
        styles.segmentedControl,
        disabled ? styles.disabled : null
      ])}>
      <div className={styles.labels}>
        {options.map((option: SegmentedControlOption, index: number) => {
          const isDisabled = disabled || option.disabled;
          const children = typeof option.children === 'undefined'
            ? `${option.value}`
            : option.children;
          return (
            <label key={index} className={styles.label}>
              <input
                {...rest}
                type="radio"
                tabIndex={0}
                value={`${option.value}`}
                checked={value === option.value}
                className={styles.input}
                disabled={isDisabled}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                {...{[ITEM_ID_DATA_ATTRIBUTE_NAME]: `${index}`}}
              />
              <div className={styles.children}>
                <div className={typeof children === 'string' ? styles.text : undefined}>
                  {children}
                </div>
              </div>
            </label>
          )
        })}
      </div>
      <div className={styles.border}/>
    </div>
  );
});
