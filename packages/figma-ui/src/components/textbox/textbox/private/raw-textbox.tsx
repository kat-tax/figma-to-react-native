import {useCallback, useRef, useState} from 'react';
import {isKeyCodeCharacterGenerating} from '../../private/is-keycode-character-generating.js';
import {getCurrentFromRef} from '../../../../utilities/get-current-from-ref.js';
import {createComponent} from '../../../../utilities/create-component.js';
import {MIXED_STRING} from '../../../../utilities/mixed-values.js';
import {noop} from '../../../../utilities/no-op.js';

import type {MutableRefObject} from 'react';
import type {Event, EventHandler} from '../../../../types/event-handler.js';
import type {FocusableComponentProps} from '../../../../types/focusable-component-props.js';

const EMPTY_STRING = '';

export interface RawTextboxProps extends FocusableComponentProps<HTMLInputElement> {
  value: string,
  placeholder?: string,
  password?: boolean,
  disabled?: boolean,
  spellCheck?: boolean,
  onBlur?: EventHandler.onBlur<HTMLInputElement>,
  onFocus?: EventHandler.onFocus<HTMLInputElement>,
  onMouseDown?: EventHandler.onMouseUp<HTMLInputElement>,
  onInput?: EventHandler.onInput<HTMLInputElement>,
  onValueInput?: EventHandler.onValueChange<string>,
  revertOnEscapeKeyDown?: boolean,
  validateOnBlur?: (value: string) => string | boolean,
}

export const RawTextbox = createComponent<HTMLInputElement, RawTextboxProps>(({
  value,
  placeholder,
  validateOnBlur,
  disabled = false,
  password = false,
  spellCheck = false,
  onBlur = noop,
  onFocus = noop,
  onInput = noop,
  onKeyDown = noop,
  onMouseDown = noop,
  onValueInput = noop,
  propagateEscapeKeyDown = true,
  revertOnEscapeKeyDown = false,
  ...rest
}, ref) => {
  // Value of the textbox when it was initially focused
  const [originalValue, setOriginalValue] = useState(EMPTY_STRING);
  const inputElementRef: MutableRefObject<HTMLInputElement | null> = useRef(null);
  const setTextboxValue = useCallback((value: string) => {
    const inputElement = getCurrentFromRef(inputElementRef);
    inputElement.value = value;
    const inputEvent = new window.Event('input', {bubbles: true, cancelable: true});
    inputElement.dispatchEvent(inputEvent);
  }, []);

  const handleBlur = useCallback((e: Event.onBlur<HTMLInputElement>) => {
    onBlur(e);
    if (typeof validateOnBlur !== 'undefined') {
      const result = validateOnBlur(value);
      if (typeof result === 'string') {
        // Set to the value returned by `validateOnBlur`
        setTextboxValue(result);
        setOriginalValue(EMPTY_STRING);
        return;
      }
      if (result === false) {
        // Revert to the original value
        if (value !== originalValue)
          setTextboxValue(originalValue);
        setOriginalValue(EMPTY_STRING);
        return;
      }
    }
    setOriginalValue(EMPTY_STRING);
  }, [onBlur, originalValue, setTextboxValue, validateOnBlur, value]);

  const handleFocus = useCallback((e: Event.onFocus<HTMLInputElement>) => {
    onFocus(e);
    setOriginalValue(value);
    e.currentTarget.select();
  }, [onFocus, value]);

  const handleInput = useCallback((e: Event.onInput<HTMLInputElement>) => {
    onInput(e);
    onValueInput(e.currentTarget.value);
  }, [onInput, onValueInput]);

  const handleKeyDown = useCallback((e: Event.onKeyDown<HTMLInputElement>) => {
    onKeyDown(e)
    if (e.key === 'Escape') {
      if (revertOnEscapeKeyDown) {
        setTextboxValue(originalValue);
        setOriginalValue(EMPTY_STRING);
      }
      if (propagateEscapeKeyDown === false)
        e.stopPropagation();
      e.currentTarget.blur();
      return;
    }
    // Prevent changing the cursor position with the keyboard if `value` is `MIXED_STRING`
    if (value === MIXED_STRING && isKeyCodeCharacterGenerating(e.keyCode) === false) {
      e.preventDefault();
      e.currentTarget.select();
    }
  }, [
    value,
    onKeyDown,
    revertOnEscapeKeyDown,
    propagateEscapeKeyDown,
    originalValue,
    setTextboxValue,
  ]);

  const handleMouseDown = useCallback((e: Event.onMouseUp<HTMLInputElement>) => {
    onMouseDown(e);
    // Prevent changing the selection if `value` is `MIXED_STRING`
    if (value === MIXED_STRING) {
      e.preventDefault();
      e.currentTarget.select();
    }
  }, [onMouseDown, value]);

  const refCallback = useCallback((inputElement: null | HTMLInputElement) => {
    inputElementRef.current = inputElement;
    if (ref === null) return;
    if (typeof ref === 'function') {
      ref(inputElement);
      return;
    }
    ref.current = inputElement;
  }, [ref]);

  return (
    <input
      {...rest}
      ref={refCallback}
      type={password ? 'password' : 'text'}
      value={value === MIXED_STRING ? 'Mixed' : value}
      disabled={disabled}
      placeholder={placeholder}
      spellCheck={spellCheck}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      tabIndex={0}
    />
  );
});
