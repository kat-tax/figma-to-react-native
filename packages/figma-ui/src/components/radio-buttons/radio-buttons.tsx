import styles from './radio-buttons.module.css';

import {useCallback} from 'react';
import {Stack, StackSpace} from '../../layout/stack/stack.js';
import {ITEM_ID_DATA_ATTRIBUTE_NAME} from '../../utilities/private/constants.js';
import {createClassName} from '../../utilities/create-class-name.js';
import {createComponent} from '../../utilities/create-component.js';
import {noop} from '../../utilities/no-op.js';

import type {ReactNode} from 'react';
import type {Event, EventHandler} from '../../types/event-handler.js';
import type {FocusableComponentProps} from '../../types/focusable-component-props.js';

export interface RadioButtonsProps extends FocusableComponentProps<HTMLDivElement> {
  value: null | string,
  options: Array<RadioButtonsOption>,
  space?: StackSpace,
  disabled?: boolean,
  onChange?: EventHandler.onChange<HTMLInputElement>,
  onValueChange?: EventHandler.onValueChange<string>,
}

export type RadioButtonsOption = {
  value: string,
  disabled?: boolean,
  children?: ReactNode,
}

export const RadioButtons = createComponent<HTMLDivElement, RadioButtonsProps>(({
  disabled = false,
  onChange = noop,
  onKeyDown = noop,
  onValueChange = noop,
  options,
  propagateEscapeKeyDown = true,
  space = 'small',
  value,
  ...rest
}, ref) => {

  const handleChange = useCallback((e: Event.onChange<HTMLInputElement>) => {
    onChange(e);
    const id = e.currentTarget.getAttribute(ITEM_ID_DATA_ATTRIBUTE_NAME);
    if (id === null)
      throw new Error('`id` is `null`');
    onValueChange(options[parseInt(id, 10)].value);
  }, [onChange, onValueChange, options]);

  const handleKeyDown = useCallback((e: Event.onKeyDown<HTMLInputElement>) => {
    onKeyDown(e)
    if (e.key === 'Escape') {
      if (propagateEscapeKeyDown === false)
        e.stopPropagation();
      e.currentTarget.blur();
    }
  }, [onKeyDown, propagateEscapeKeyDown]);

  return (
    <div ref={ref} className={styles.radioButtons}>
      <Stack space={space}>
        {options.map((option: RadioButtonsOption, index: number) => {
          const isOptionDisabled = disabled === true || option.disabled === true;
          const children = typeof option.children === 'undefined'
            ? `${option.value}`
            : option.children;
          return (
            <label
              key={index}
              className={createClassName([
                styles.label,
                isOptionDisabled === true ? styles.disabled : null
              ])}>
              <input
                {...rest}
                type="radio"
                value={`${option.value}`}
                checked={value === option.value}
                disabled={isOptionDisabled === true}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={styles.input}
                tabIndex={0}
                {...{[ITEM_ID_DATA_ATTRIBUTE_NAME]: `${index}`}}
              />
              <div className={styles.fill}/>
              <div className={styles.border}/>
              <div className={styles.children}>{children}</div>
            </label>
          );
        })}
      </Stack>
    </div>
  );
});
