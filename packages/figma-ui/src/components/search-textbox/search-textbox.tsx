import styles from './search-textbox.module.css';

import {useCallback, useRef} from 'react';
import {IconCross32} from '../../icons/icon-32/icon-cross-32.js';
import {IconSearch32} from '../../icons/icon-32/icon-search-32.js';
import {createClassName} from '../../utilities/create-class-name.js';
import {createComponent} from '../../utilities/create-component.js';
import {getCurrentFromRef} from '../../utilities/get-current-from-ref.js';
import {noop} from '../../utilities/no-op.js';

import type {RefObject} from 'react';
import type {Event, EventHandler} from '../../types/event-handler.js';
import type {FocusableComponentProps} from '../../types/focusable-component-props.js';

const EMPTY_STRING = '';

export interface SearchTextboxProps extends FocusableComponentProps<HTMLInputElement> {
  value: string,
  placeholder?: string,
  spellCheck?: boolean,
  disabled?: boolean,
  clearOnEscapeKeyDown?: boolean,
  onFocus?: EventHandler.onFocus<HTMLInputElement>,
  onInput?: EventHandler.onInput<HTMLInputElement>,
  onKeyDown?: EventHandler.onKeyDown<HTMLInputElement>,
  onValueInput?: EventHandler.onValueChange<string>,
}

export const SearchTextbox = createComponent<HTMLInputElement, SearchTextboxProps>(({
  clearOnEscapeKeyDown = false,
  disabled = false,
  onFocus = noop,
  onInput = noop,
  onKeyDown = noop,
  onValueInput = noop,
  placeholder,
  propagateEscapeKeyDown = true,
  spellCheck = false,
  value,
  ...rest
}, ref) => {

  const inputElementRef: RefObject<HTMLInputElement> = useRef(null);
  const handleClearButtonClick = useCallback(() => {
    const inputEvent = new window.Event('input', {bubbles: true, cancelable: true});
    const inputElement = getCurrentFromRef(inputElementRef);
    inputElement.value = EMPTY_STRING;
    inputElement.dispatchEvent(inputEvent);
    inputElement.focus();
  }, []);

  const handleFocus = useCallback((e: Event.onFocus<HTMLInputElement>) => {
    onFocus(e);
    e.currentTarget.select();
  },  [onFocus]);

  const handleInput = useCallback((e: Event.onInput<HTMLInputElement>) => {
    onInput(e);
    const value = e.currentTarget.value;
    onValueInput(value);
  },  [onInput, onValueInput]);

  const handleKeyDown = useCallback((e: Event.onKeyDown<HTMLInputElement>) => {
    onKeyDown(e)
    if (e.key === 'Escape') {
      if (clearOnEscapeKeyDown && value !== EMPTY_STRING) {
        // Clear the value without bubbling up the `Escape` key press
        e.stopPropagation();
        handleClearButtonClick();
        return;
      }
      if (propagateEscapeKeyDown === false)
        e.stopPropagation();
      e.currentTarget.blur();
    }
  }, [
    value,
    onKeyDown,
    clearOnEscapeKeyDown,
    handleClearButtonClick,
    propagateEscapeKeyDown,
  ]);

  const refCallback = useCallback((inputElement: null | HTMLInputElement) => {
    inputElementRef.current = inputElement;
    if (ref === null) {
      return
    }
    if (typeof ref === 'function') {
      ref(inputElement)
      return
    }
    ref.current = inputElement
  }, [ref]);

  return (
    <div
      className={createClassName([
        styles.searchTextbox,
        disabled ? styles.disabled : null
      ])}>
      <input
        {...rest}
        ref={refCallback}
        type="text"
        value={value}
        disabled={disabled}
        onFocus={handleFocus}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        spellCheck={spellCheck}
        className={styles.input}
        tabIndex={0}
      />
      <div className={styles.searchIcon}>
        <IconSearch32/>
      </div>
      {value === EMPTY_STRING || disabled
        ? null
        : <button
            className={styles.clearButton}
            onClick={handleClearButtonClick}
            tabIndex={0}>
          <IconCross32/>
        </button>
      }
    </div>
  );
});
