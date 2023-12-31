import {useCallback, useRef, useState} from 'react';
import {isKeyCodeCharacterGenerating} from '../../private/is-keycode-character-generating.js';
import {computeNextValue} from '../../private/compute-next-value.js';
import {formatEvaluatedValue} from './format-evaluated-value.js';
import {isValidNumericInput} from '../../../../utilities/is-valid-numeric-input.js';
import {evaluateNumericExpression} from '../../../../utilities/evaluate-numeric-expression.js';
import {MIXED_NUMBER, MIXED_STRING} from '../../../../utilities/mixed-values.js';
import {getCurrentFromRef} from '../../../../utilities/get-current-from-ref.js';
import {createComponent} from '../../../../utilities/create-component.js';
import {noop} from '../../../../utilities/no-op.js';

import type {RefObject} from 'react';
import type {Event, EventHandler} from '../../../../types/event-handler.js';
import type {FocusableComponentProps} from '../../../../types/focusable-component-props.js';

const FRACTION_DIGITS = 3;
const EMPTY_STRING = '';

export interface RawTextboxNumericProps extends FocusableComponentProps<HTMLInputElement> {
  value: string,
  integer?: boolean,
  maximum?: number,
  minimum?: number,
  incrementBig?: number,
  incrementSmall?: number,
  placeholder?: string,
  suffix?: string,
  disabled?: boolean,
  onBlur?: EventHandler.onBlur<HTMLInputElement>,
  onFocus?: EventHandler.onFocus<HTMLInputElement>,
  onInput?: EventHandler.onInput<HTMLInputElement>,
  onMouseDown?: EventHandler.onMouseUp<HTMLInputElement>,
  onValueInput?: EventHandler.onValueChange<string>,
  onNumericValueInput?: EventHandler.onValueChange<null | number>,
  revertOnEscapeKeyDown?: boolean,
  validateOnBlur?: (value: null | number) => null | number | boolean,
}

export const RawTextboxNumeric = createComponent<HTMLInputElement, RawTextboxNumericProps>(({
  value,
  maximum,
  minimum,
  suffix,
  placeholder,
  disabled = false,
  incrementBig = 10,
  incrementSmall = 1,
  integer = false,
  onBlur = noop,
  onFocus = noop,
  onInput = noop,
  onMouseDown = noop,
  onKeyDown = noop,
  onValueInput = noop,
  onNumericValueInput = noop,
  propagateEscapeKeyDown = true,
  revertOnEscapeKeyDown = false,
  validateOnBlur,
  ...rest
}, ref) => {
  if (
    typeof minimum !== 'undefined' &&
    typeof maximum !== 'undefined' &&
    minimum >= maximum
  ) {
    throw new Error('`minimum` must be less than `maximum`');
  }

  // Value of the textbox when it was initially focused
  const [originalValue, setOriginalValue] = useState(EMPTY_STRING);

  // Set to `true` when the `Escape` key is pressed; used to bail out of `handleBlur`
  const revertOnEscapeKeyDownRef: RefObject<boolean> = useRef(false);
  const inputElementRef: RefObject<HTMLInputElement> = useRef(null);

  const setInputElementValue = useCallback((value: string) => {
    const inputElement = getCurrentFromRef(inputElementRef);
    inputElement.value = value;
    const inputEvent = new window.Event('input', {bubbles: true, cancelable: true});
    inputElement.dispatchEvent(inputEvent);
  }, []);

  const handleBlur = useCallback((event: Event.onBlur<HTMLInputElement>) => {
    onBlur(event);
    if (revertOnEscapeKeyDownRef.current) {
      revertOnEscapeKeyDownRef.current = false;
      return;
    }
    if (typeof validateOnBlur !== 'undefined') {
      const evaluatedValue = evaluateValue(value, suffix);
      const result = validateOnBlur(evaluatedValue);
      // Set to the value returned by `validateOnBlur`
      if (typeof result === 'number') {
        setInputElementValue(formatEvaluatedValue(result, value, suffix));
        setOriginalValue(EMPTY_STRING);
        return;
      }
      // Set value to the empty string
      if (result === null) {
        setInputElementValue(EMPTY_STRING);
        setOriginalValue(EMPTY_STRING);
        return;
      }
      // Revert the original value
      if (!result) {
        if (value !== originalValue)
          setInputElementValue(originalValue);
        setOriginalValue(EMPTY_STRING);
        return;
      }
    }
    // We don't want a textbox to contain just the `suffix`, so clear the `value`
    if (typeof suffix !== 'undefined' && value === suffix) {
      setInputElementValue(EMPTY_STRING);
      setOriginalValue(EMPTY_STRING);
      return;
    }
    if (value !== EMPTY_STRING && value !== MIXED_STRING) {
      const evaluatedValue = evaluateValue(value, suffix);
      const formattedValue = formatEvaluatedValue(evaluatedValue, value, suffix);
      if (value !== formattedValue) {
        setInputElementValue(formattedValue)
      }
    }
    setOriginalValue(EMPTY_STRING);
  }, [onBlur, originalValue, setInputElementValue, suffix, validateOnBlur, value]);

  const handleFocus = useCallback((e: Event.onFocus<HTMLInputElement>) => {
    onFocus(e);
    setOriginalValue(value);
    e.currentTarget.select();
  }, [onFocus, value]);

  const handleInput = useCallback((e: Event.onInput<HTMLInputElement>) => {
    onInput(e);
    const newValue = e.currentTarget.value;
    onValueInput(newValue);
    onNumericValueInput(evaluateValue(newValue, suffix));
  }, [onInput, onNumericValueInput, onValueInput, suffix]);

  const handleKeyDown = useCallback((e: Event.onKeyDown<HTMLInputElement>) => {
    onKeyDown(e);

    const key = e.key;
    if (key === 'Escape') {
      if (revertOnEscapeKeyDown) {
        revertOnEscapeKeyDownRef.current = true;
        setInputElementValue(originalValue);
        setOriginalValue(EMPTY_STRING);
      }
      if (!propagateEscapeKeyDown)
        e.stopPropagation();
      e.currentTarget.blur();
      return;
    }

    const inputElement = e.currentTarget;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      const delta = e.shiftKey ? incrementBig : incrementSmall;
      e.preventDefault();
      if (value === EMPTY_STRING || value === MIXED_STRING) {
        // `startingValue` is biased towards 0
        const startingValue = (() => {
          if (typeof minimum !== 'undefined' && minimum > 0)
            return minimum;
          if (typeof maximum !== 'undefined' && maximum < 0)
            return maximum;
          return 0;
        })();

        const evaluatedValue = evaluateValueWithDelta(
          startingValue,
          key === 'ArrowDown' ? -1 * delta : delta
        );

        const newValue = restrictValue(evaluatedValue, minimum, maximum);
        const formattedValue = formatEvaluatedValue(newValue, value, suffix);
        inputElement.value = formattedValue;
        inputElement.select();
        handleInput(e);
        return;
      }

      const number = evaluateValue(value, suffix);
      if (number === null) {
        throw new Error('`number` is `null`');
      }

      const evaluatedValue = evaluateValueWithDelta(
        number,
        key === 'ArrowDown' ? -1 * delta : delta
      );

      const newValue = restrictValue(evaluatedValue, minimum, maximum);
      const formattedValue = formatEvaluatedValue(newValue, value, suffix);
      if (formattedValue === value) {
        return;
      }

      inputElement.value = formattedValue;
      inputElement.select();
      handleInput(e);
      return;
    }

    if (e.ctrlKey || e.metaKey)
      return;

    if (isKeyCodeCharacterGenerating(e.keyCode)) {
      // Piece together `newValue` using the key that was pressed, and stop
      // the `keyDown` event (by calling `event.preventDefault()`) if
      // `newValue` is found to be invalid
      const newValue = trimSuffix(
        value === MIXED_STRING ? e.key : computeNextValue(inputElement, e.key),
        suffix
      );

      if (!isValidNumericInput(newValue, {integersOnly: integer})) {
        e.preventDefault();
        return;
      }

      if (typeof minimum === 'undefined' && typeof maximum === 'undefined') {
        return;
      }

      const evaluatedValue = evaluateNumericExpression(newValue);
      if (evaluatedValue === null) {
        return;
      }

      if (
        (typeof minimum !== 'undefined' && evaluatedValue < minimum) ||
        (typeof maximum !== 'undefined' && evaluatedValue > maximum)
      ) {
        e.preventDefault();
      }
    }
  }, [
    value,
    suffix,
    maximum,
    minimum,
    integer,
    incrementBig,
    incrementSmall,
    revertOnEscapeKeyDown,
    propagateEscapeKeyDown,
    onKeyDown,
    handleInput,
    originalValue,
    setInputElementValue,
  ]);

  const handleMouseDown = useCallback((e: Event.onMouseUp<HTMLInputElement>) => {
    onMouseDown(e);
    // Prevent changing the selection if `value` is `MIXED_STRING`
    if (value === MIXED_STRING) {
      e.preventDefault();
      e.currentTarget.select();
    }
  }, [onMouseDown, value]);

  const handlePaste = useCallback((e: Event.onPaste<HTMLInputElement>) => {
    if (e.clipboardData === null) {
      throw new Error('`event.clipboardData` is `null`');
    }
    const nextValue = trimSuffix(
      computeNextValue(
        e.currentTarget,
        e.clipboardData.getData('Text')
      ),
      suffix
    );
    if (!isValidNumericInput(nextValue, {integersOnly: integer})) {
      e.preventDefault();
    }
  }, [integer, suffix]);

  const refCallback = useCallback((inputElement: null | HTMLInputElement) => {
    inputElementRef.current = inputElement;
    if (ref === null)
      return;
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
      type="text"
      value={value === MIXED_STRING ? 'Mixed' : value}
      placeholder={placeholder}
      spellCheck={false}
      disabled={disabled}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onPaste={handlePaste}
      tabIndex={0}
    />
  )
})

function restrictValue(value: number, minimum?: number, maximum?: number) {
  if (typeof minimum !== 'undefined') {
    if (typeof maximum !== 'undefined') {
      // both `minimum` and `maximum` are defined
      return Math.min(Math.max(value, minimum), maximum);
    }
    // only `minimum` is defined
    return Math.max(value, minimum);
  }
  if (typeof maximum !== 'undefined') {
    // only `maximum` is defined
    return Math.min(value, maximum);
  }
  // both `minimum` and `maximum` are `undefined`
  return value;
}

function evaluateValue(value: string, suffix?: string): null | number {
  if (value === MIXED_STRING)
    return MIXED_NUMBER;
  if (value === EMPTY_STRING)
    return null;
  return evaluateNumericExpression(trimSuffix(value, suffix));
}

function evaluateValueWithDelta(value: number, delta: number): number {
  return parseFloat((value + delta).toFixed(FRACTION_DIGITS));
}

function trimSuffix(string: string, suffix?: string): string {
  if (typeof suffix === 'undefined')
    return string;
  return string.replace(new RegExp(`${suffix}$`), EMPTY_STRING);
}
