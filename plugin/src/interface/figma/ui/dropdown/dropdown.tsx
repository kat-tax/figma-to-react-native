import dropdownStyles from './dropdown.module.css';
import menuStyles from '../../css/menu.module.css';

import {createPortal} from 'react-dom';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useScrollableMenu} from '../../hooks/use-scrollable-menu.js';
import {useMouseDownOutside} from '../../hooks/use-mouse-down-outside.js';
// import {IconControlChevronDown8} from '../../icons/icon-8/icon-control-chevron-down-8.js';
// import {IconMenuCheckmarkChecked16} from '../../icons/icon-16/icon-menu-checkmark-checked-16.js';
import {updateMenuElementLayout} from './private/update-menu-element-layout.js';
import {INVALID_ID, ITEM_ID_DATA_ATTRIBUTE_NAME} from '../../lib/private/constants.js';
import {getCurrentFromRef} from '../../lib/get-current-from-ref.js';
import {createClassName} from '../../lib/create-class-name.js';
import {createComponent} from '../../lib/create-component.js';
import {noop} from '../../lib/no-op.js';

import type {ReactNode, MutableRefObject} from 'react';
import type {Event, EventHandler} from '../../types/event-handler.js'
import type {Id} from './private/types.js';

export interface DropdownProps {
  value: null | string,
  options: Array<DropdownOption>,
  placeholder?: string,
  variant?: DropdownVariant,
  icon?: ReactNode,
  disabled?: boolean,
  onChange?: EventHandler.onChange<HTMLInputElement>,
  onKeyDown?: EventHandler.onKeyDown<HTMLDivElement>,
  onMouseDown?: EventHandler.onMouseDown<HTMLDivElement>,
  onValueChange?: EventHandler.onValueChange<string>,
  propagateEscapeKeyDown?: boolean,
}

export type DropdownOption =
  | DropdownOptionHeader
  | DropdownOptionSeparator
  | DropdownOptionValue;

export type DropdownOptionHeader = {
  header: string,
}

export type DropdownOptionSeparator = '-';
export type DropdownOptionValue = {
  disabled?: boolean,
  text?: string,
  value: string,
}

export type DropdownVariant = 'border' | 'underline';

export const Dropdown = createComponent<HTMLDivElement, DropdownProps>(({
  value,
  options,
  icon,
  variant,
  placeholder,
  disabled = false,
  onChange = noop,
  onKeyDown = noop,
  onMouseDown = noop,
  onValueChange = noop,
  propagateEscapeKeyDown = true,
  ...rest
}, ref) => {
  if (typeof icon === 'string' && icon.length !== 1) {
    throw new Error(`String \`icon\` must be a single character: "${icon}"`)
  }
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const rootElementRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const menuElementRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const index = findOptionIndexByValue(options, value);
  if (value !== null && index === -1) {
    throw new Error(`Invalid \`value\`: ${value}`)
  }

  const [selectedId, setSelectedId] = useState<Id>(
    index === -1 ? INVALID_ID : `${index}`
  );

  const children = typeof options[index] === 'undefined'
    ? ''
    : getDropdownOptionValue(options[index]);

  // Uncomment to debug
  // console.table([{ isMenuVisible, selectedId }])

  const {handleScrollableMenuKeyDown, handleScrollableMenuItemMouseMove} = useScrollableMenu({
    itemIdDataAttributeName: ITEM_ID_DATA_ATTRIBUTE_NAME,
    menuElementRef,
    selectedId,
    setSelectedId,
  });

  const triggerRootBlur = useCallback(() => {
    getCurrentFromRef(rootElementRef).blur();
  }, []);

  const triggerRootFocus = useCallback(() => {
    getCurrentFromRef(rootElementRef).focus();
  }, []);

  const triggerMenuUpdateLayout = useCallback((selectedId: Id) => {
    const rootElement = getCurrentFromRef(rootElementRef);
    const menuElement = getCurrentFromRef(menuElementRef);
    updateMenuElementLayout(rootElement, menuElement, selectedId);
  }, []);

  const triggerMenuHide = useCallback(() => {
    setIsMenuVisible(false);
    setSelectedId(INVALID_ID);
  }, []);

  const triggerMenuShow = useCallback(() => {
    if (isMenuVisible) return;
    // Show the menu and update the `selectedId` on focus
    setIsMenuVisible(true);
    if (value === null) {
      triggerMenuUpdateLayout(selectedId);
      return;
    }
    const index = findOptionIndexByValue(options, value);
    if (index === -1) {
      throw new Error(`Invalid \`value\`: ${value}`);
    }
    const newSelectedId = `${index}`;
    setSelectedId(newSelectedId);
    triggerMenuUpdateLayout(newSelectedId);
  }, [isMenuVisible, options, selectedId, triggerMenuUpdateLayout, value]);

  const handleRootKeyDown = useCallback((e: Event.onKeyDown<HTMLDivElement>) => {
    onKeyDown(e);
    const key = e.key;
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      e.preventDefault();
      if (isMenuVisible === false) {
        triggerMenuShow();
        return;
      }
      handleScrollableMenuKeyDown(e);
      return;
    }
    if (key === 'Escape') {
      e.preventDefault();
      if (propagateEscapeKeyDown === false) {
        e.stopPropagation();
      }
      if (isMenuVisible) {
        triggerMenuHide();
        return;
      }
      triggerRootBlur();
      return;
    }
    if (key === 'Enter') {
      e.preventDefault();
      if (isMenuVisible === false) {
        triggerMenuShow();
        return;
      }
      if (selectedId !== INVALID_ID) {
        const selectedElement = getCurrentFromRef(menuElementRef)
          .querySelector<HTMLInputElement>(`[${ITEM_ID_DATA_ATTRIBUTE_NAME}='${selectedId}']`);
        if (selectedElement === null)
          throw new Error('`selectedElement` is `null`');
        const changeEvent = new window.Event('change', {bubbles: true, cancelable: true});
        selectedElement.checked = true;
        selectedElement.dispatchEvent(changeEvent);
      }
      triggerMenuHide();
      return;
    }
    if (key === 'Tab') {
      triggerMenuHide();
      return;
    }
  }, [
    selectedId,
    isMenuVisible,
    triggerMenuHide,
    triggerMenuShow,
    triggerRootBlur,
    handleScrollableMenuKeyDown,
    propagateEscapeKeyDown,
    onKeyDown,
  ]);

  const handleRootMouseDown = useCallback((e: Event.onMouseDown<HTMLDivElement>) => {
    // `mousedown` events from `menuElement` are stopped from propagating to `rootElement` by `handleMenuMouseDown`
    onMouseDown(e);
    if (isMenuVisible === false)
      triggerMenuShow();
  }, [isMenuVisible, onMouseDown, triggerMenuShow]);

  const handleMenuMouseDown = useCallback((e: Event.onMouseDown<HTMLDivElement>) => {
    // Stop the `mousedown` event from propagating to the `rootElement`
    e.stopPropagation();
  }, []);

  const handleOptionChange = useCallback((e: Event.onChange<HTMLInputElement>) => {
    onChange(e);
    const id = e.currentTarget.getAttribute(ITEM_ID_DATA_ATTRIBUTE_NAME);
    if (id === null)
      throw new Error('`id` is `null`');
    const optionValue = options[parseInt(id, 10)] as DropdownOptionValue;
    const newValue = optionValue.value;
    onValueChange(newValue);
    // Select `root`, then hide the menu
    triggerRootFocus();
    triggerMenuHide();
  }, [onChange, onValueChange, options, triggerMenuHide, triggerRootFocus]);

  const handleSelectedOptionClick = useCallback(() => {
    triggerRootFocus();
    triggerMenuHide();
  }, [triggerMenuHide, triggerRootFocus]);

  const handleMouseDownOutside = useCallback(() => {
    if (isMenuVisible === false) return;
    triggerMenuHide();
    triggerRootBlur();
  }, [isMenuVisible, triggerRootBlur, triggerMenuHide]);

  useMouseDownOutside({
    onMouseDownOutside: handleMouseDownOutside,
    ref: rootElementRef,
  });

  useEffect(() => {
    const handleWindowScroll = () => {
      if (isMenuVisible === false) return;
      triggerRootFocus();
      triggerMenuHide();
    };
    window.addEventListener('scroll', handleWindowScroll);
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [isMenuVisible, triggerMenuHide, triggerRootFocus]);

  const refCallback = useCallback((rootElement: null | HTMLDivElement) => {
    rootElementRef.current = rootElement
    if (ref === null) return;
    if (typeof ref === 'function') {
      ref(rootElement);
      return;
    }
    ref.current = rootElement;
  }, [ref, rootElementRef]);

  return (
    <div
      {...rest}
      ref={refCallback}
      className={createClassName([
        dropdownStyles.dropdown,
        variant === 'border' ? dropdownStyles.hasBorder : null,
        typeof icon !== 'undefined' ? dropdownStyles.hasIcon : null,
        disabled ? dropdownStyles.disabled : null
      ])}
      onKeyDown={disabled ? undefined : handleRootKeyDown}
      onMouseDown={handleRootMouseDown}
      tabIndex={0}>
      {typeof icon === 'undefined'
        ? null
        : <div className={dropdownStyles.icon}>{icon}</div>
      }
      {value === null
        ? typeof placeholder === 'undefined'
          ? <div className={dropdownStyles.empty}/>
          : <div className={createClassName([
              dropdownStyles.value,
              dropdownStyles.placeholder,
            ])}>
              {placeholder}
            </div>
        : <div className={dropdownStyles.value}>{children}</div>
      }
      <div className={dropdownStyles.chevronIcon}>
        {/* <IconControlChevronDown8/> */}
      </div>
      {variant === 'underline'
        ? <div className={dropdownStyles.underline}/>
        : null
      }
      <div className={dropdownStyles.border}/>
      {createPortal(
        <div
          ref={menuElementRef}
          className={createClassName([
            menuStyles.menu,
            dropdownStyles.menu,
            disabled || isMenuVisible === false
              ? menuStyles.hidden
              : null
          ])}
          onMouseDown={handleMenuMouseDown}>
          {options.map((option: DropdownOption, index: number) => {
            if (typeof option === 'string') {
              return (
                <hr key={index} className={menuStyles.optionSeparator}/>
              );
            }
            if ('header' in option) {
              return (
                <h1 key={index} className={menuStyles.optionHeader}>
                  {option.header}
                </h1>
              );
            }
            return (
              <label
                key={index}
                className={createClassName([
                  menuStyles.optionValue,
                  option.disabled
                    ? menuStyles.optionValueDisabled
                    : null,
                  option.disabled !== true && `${index}` === selectedId
                    ? menuStyles.optionValueSelected
                    : null
                ])}>
                <input
                  tabIndex={-1}
                  type="radio"
                  value={`${option.value}`}
                  checked={value === option.value}
                  disabled={option.disabled}
                  className={menuStyles.input}
                  // If clicked on an unselected element, set the value
                  onChange={value === option.value ? noop : handleOptionChange}
                  // Else hide the menu if clicked on an already-selected element
                  onClick={value === option.value ? handleSelectedOptionClick : undefined}
                  onMouseMove={handleScrollableMenuItemMouseMove}
                  {...{[ITEM_ID_DATA_ATTRIBUTE_NAME]: `${index}`}}
                />
                {option.value === value
                  ? <div className={menuStyles.checkIcon}>
                      {/* <IconMenuCheckmarkChecked16/> */}
                    </div>
                  : null
                }
                {typeof option.text === 'undefined'
                  ? option.value
                  : option.text
                }
              </label>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  )
}
)

function getDropdownOptionValue(option: DropdownOption): ReactNode {
  if (typeof option !== 'string') {
    if ('text' in option)
      return option.text;
    if ('value' in option)
      return option.value;
  }
  throw new Error('Invariant violation');
}

// Returns the index of the option in `options` with the given `value`, else `-1`
function findOptionIndexByValue(options: Array<DropdownOption>, value: null | string): number {
  if (value === null)
    return -1;
  let index = 0;
  for (const option of options) {
    if (
      typeof option !== 'string' &&
      'value' in option &&
      option.value === value
    ) {
      return index;
    }
    index += 1;
  }
  return -1;
}
