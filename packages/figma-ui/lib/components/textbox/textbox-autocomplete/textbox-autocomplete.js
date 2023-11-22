import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import menuStyles from '../../../css/menu.module.css';
import { useMouseDownOutside } from '../../../hooks/use-mouse-down-outside.js';
import { IconMenuCheckmarkChecked16 } from '../../../icons/icon-16/icon-menu-checkmark-checked-16.js';
import { createClassName } from '../../../utilities/create-class-name.js';
import { createComponent } from '../../../utilities/create-component.js';
import { getCurrentFromRef } from '../../../utilities/get-current-from-ref.js';
import { noop } from '../../../utilities/no-op.js';
import { INVALID_ID, ITEM_ID_DATA_ATTRIBUTE_NAME, VIEWPORT_MARGIN } from '../../../utilities/private/constants.js';
import { computeNextValue } from '../private/compute-next-value.js';
import { isKeyCodeCharacterGenerating } from '../private/is-keycode-character-generating.js';
import textboxStyles from '../textbox/textbox.module.css';
import textboxAutocompleteStyles from './textbox-autocomplete.module.css';
const EMPTY_STRING = '';
export const TextboxAutocomplete = createComponent(function ({ disabled = false, filter = false, icon, onChange = noop, onInput = noop, onKeyDown = noop, onMouseDown = noop, onPaste = noop, onValueInput = noop, placeholder, propagateEscapeKeyDown = true, revertOnEscapeKeyDown = false, spellCheck = false, strict = false, top = false, value, variant, ...rest }, ref) {
    if (typeof icon === 'string' && icon.length !== 1) {
        throw new Error(`String \`icon\` must be a single character: ${icon}`);
    }
    const rootElementRef = useRef(null);
    const inputElementRef = useRef(null);
    const menuElementRef = useRef(null);
    const revertOnEscapeKeyDownRef = useRef(false);
    const [originalValue, setOriginalValue] = useState(value);
    const [editedValue, setEditedValue] = useState(EMPTY_STRING);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [selectedId, setSelectedId] = useState(INVALID_ID);
    const options = filter === true
        ? filterOptions(createOptions(rest.options), value, editedValue)
        : createOptions(rest.options);
    const triggerTextboxSelect = useCallback(function () {
        getCurrentFromRef(inputElementRef).select();
    }, []);
    const triggerTextboxBlur = useCallback(function () {
        getCurrentFromRef(inputElementRef).blur();
    }, []);
    const triggerMenuUpdateScrollPosition = useCallback(function (id) {
        const menuElement = getCurrentFromRef(menuElementRef);
        if (id === INVALID_ID) {
            menuElement.scrollTop = 0;
            return;
        }
        const selectedElement = menuElement.querySelector(`[${ITEM_ID_DATA_ATTRIBUTE_NAME}='${id}']`);
        if (selectedElement === null) {
            throw new Error('`selectedElement` is `null`');
        }
        const y = selectedElement.getBoundingClientRect().y -
            menuElement.getBoundingClientRect().y;
        if (y < menuElement.scrollTop) {
            menuElement.scrollTop = y;
            return;
        }
        const offsetBottom = y + selectedElement.offsetHeight;
        if (offsetBottom > menuElement.scrollTop + menuElement.offsetHeight) {
            menuElement.scrollTop = offsetBottom - menuElement.offsetHeight;
        }
    }, []);
    const updateSelectedId = useCallback(function (value) {
        const id = getIdByValue(options, value);
        if (id === INVALID_ID) {
            setEditedValue(value);
        }
        setSelectedId(id);
        triggerMenuUpdateScrollPosition(id);
    }, [options, triggerMenuUpdateScrollPosition]);
    const updateTextboxValue = useCallback(function (value) {
        const inputElement = getCurrentFromRef(inputElementRef);
        inputElement.value = value;
        const inputEvent = new window.Event('input', {
            bubbles: true,
            cancelable: true
        });
        inputElement.dispatchEvent(inputEvent);
    }, []);
    const triggerMenuHide = useCallback(function () {
        setIsMenuVisible(false);
    }, []);
    const triggerMenuShow = useCallback(function () {
        updateMenuElementMaxHeight(getCurrentFromRef(rootElementRef), getCurrentFromRef(menuElementRef), top);
        setOriginalValue(value);
        updateSelectedId(value);
        setIsMenuVisible(true);
    }, [top, updateSelectedId, value]);
    const handleTextboxInput = useCallback(function (event) {
        onInput(event);
        const newValue = event.currentTarget.value;
        updateSelectedId(newValue);
        onValueInput(newValue);
        if (isMenuVisible === true) {
            return;
        }
        if (revertOnEscapeKeyDownRef.current === true) {
            revertOnEscapeKeyDownRef.current = false;
            return;
        }
        triggerMenuShow();
    }, [isMenuVisible, onInput, onValueInput, triggerMenuShow, updateSelectedId]);
    const handleTextboxKeyDown = useCallback(function (event) {
        onKeyDown(event);
        const inputElement = event.currentTarget;
        const key = event.key;
        if (key === 'ArrowUp' || key === 'ArrowDown') {
            event.preventDefault();
            if (isMenuVisible === false) {
                triggerMenuShow();
                return;
            }
            if (options.length === 0) {
                return;
            }
            const id = key === 'ArrowUp'
                ? computePreviousId(options, selectedId)
                : computeNextId(options, selectedId);
            if (id === INVALID_ID) {
                setSelectedId(INVALID_ID);
                updateTextboxValue(editedValue);
                triggerTextboxSelect();
                triggerMenuUpdateScrollPosition(INVALID_ID);
                return;
            }
            setSelectedId(id);
            const optionValue = findOptionValueById(options, id);
            if (optionValue === null) {
                throw new Error('`optionValue` is `null`');
            }
            updateTextboxValue(optionValue.value);
            triggerTextboxSelect();
            triggerMenuUpdateScrollPosition(id);
            return;
        }
        if (key === 'Escape') {
            event.preventDefault();
            if (propagateEscapeKeyDown === false) {
                event.stopPropagation();
            }
            if (revertOnEscapeKeyDown === true) {
                revertOnEscapeKeyDownRef.current = true;
                updateTextboxValue(originalValue);
            }
            if (isMenuVisible === true) {
                triggerMenuHide();
                return;
            }
            triggerTextboxBlur();
            return;
        }
        if (key === 'Enter') {
            event.preventDefault();
            triggerTextboxSelect();
            if (isMenuVisible === true) {
                triggerMenuHide();
                return;
            }
            triggerMenuShow();
            return;
        }
        if (key === 'Tab') {
            triggerMenuHide();
            return;
        }
        if (strict === false) {
            return;
        }
        if (event.ctrlKey === true || event.metaKey === true) {
            return;
        }
        if (isKeyCodeCharacterGenerating(event.keyCode) === true) {
            const nextValue = computeNextValue(inputElement, event.key);
            if (isValidValue(options, nextValue) === true) {
                return;
            }
            event.preventDefault();
        }
    }, [
        editedValue,
        isMenuVisible,
        onKeyDown,
        options,
        originalValue,
        propagateEscapeKeyDown,
        revertOnEscapeKeyDown,
        selectedId,
        strict,
        triggerMenuHide,
        triggerMenuShow,
        triggerMenuUpdateScrollPosition,
        triggerTextboxBlur,
        triggerTextboxSelect,
        updateTextboxValue
    ]);
    const handleTextboxMouseDown = useCallback(function (event) {
        onMouseDown(event);
        if (isMenuVisible === true) {
            return;
        }
        event.preventDefault();
        triggerTextboxSelect();
        triggerMenuShow();
    }, [isMenuVisible, onMouseDown, triggerTextboxSelect, triggerMenuShow]);
    const handleTextboxPaste = useCallback(function (event) {
        onPaste(event);
        if (strict === false) {
            return;
        }
        if (event.clipboardData === null) {
            throw new Error('`event.clipboardData` is `null`');
        }
        const nextValue = computeNextValue(event.currentTarget, event.clipboardData.getData('Text'));
        if (isValidValue(options, nextValue) === true) {
            return;
        }
        event.preventDefault();
    }, [onPaste, options, strict]);
    const handleOptionChange = useCallback(function (event) {
        onChange(event);
        const id = event.currentTarget.getAttribute(ITEM_ID_DATA_ATTRIBUTE_NAME);
        if (id === null) {
            throw new Error('`id` is `null`');
        }
        setSelectedId(id);
        const optionValue = findOptionValueById(options, id);
        if (optionValue === null) {
            throw new Error('`optionValue` is `null`');
        }
        updateTextboxValue(optionValue.value);
        triggerTextboxSelect();
        triggerMenuHide();
    }, [
        onChange,
        options,
        triggerMenuHide,
        triggerTextboxSelect,
        updateTextboxValue
    ]);
    const handleOptionMouseMove = useCallback(function (event) {
        const id = event.currentTarget.getAttribute(ITEM_ID_DATA_ATTRIBUTE_NAME);
        if (id === null) {
            throw new Error('`id` is `null`');
        }
        if (id === selectedId) {
            return;
        }
        setSelectedId(id);
    }, [selectedId]);
    const handleMouseDownOutside = useCallback(function () {
        if (isMenuVisible === false) {
            return;
        }
        triggerMenuHide();
        triggerTextboxBlur();
    }, [isMenuVisible, triggerTextboxBlur, triggerMenuHide]);
    useMouseDownOutside({
        onMouseDownOutside: handleMouseDownOutside,
        ref: rootElementRef
    });
    useEffect(function () {
        function handleWindowScroll() {
            if (isMenuVisible === false) {
                return;
            }
            triggerMenuHide();
            triggerTextboxSelect();
        }
        window.addEventListener('scroll', handleWindowScroll);
        return function () {
            window.removeEventListener('scroll', handleWindowScroll);
        };
    }, [isMenuVisible, triggerMenuHide, triggerTextboxSelect]);
    const refCallback = useCallback(function (inputElement) {
        inputElementRef.current = inputElement;
        if (ref === null) {
            return;
        }
        if (typeof ref === 'function') {
            ref(inputElement);
            return;
        }
        ref.current = inputElement;
    }, [ref]);
    return (h("div", { ref: rootElementRef, class: createClassName([
            textboxStyles.textbox,
            typeof variant === 'undefined'
                ? null
                : variant === 'border'
                    ? textboxStyles.hasBorder
                    : null,
            typeof icon === 'undefined' ? null : textboxStyles.hasIcon,
            disabled === true ? textboxStyles.disabled : null
        ]) },
        h("div", { class: textboxStyles.inner },
            h("input", { ...rest, ref: refCallback, class: textboxStyles.input, disabled: disabled === true, onInput: handleTextboxInput, onKeyDown: handleTextboxKeyDown, onMouseDown: handleTextboxMouseDown, onPaste: handleTextboxPaste, placeholder: placeholder, spellcheck: spellCheck, tabIndex: 0, type: "text", value: value }),
            typeof icon === 'undefined' ? null : (h("div", { class: textboxStyles.icon }, icon)),
            h("div", { class: textboxStyles.border }),
            variant === 'underline' ? (h("div", { class: textboxStyles.underline })) : null,
            h("div", { ref: menuElementRef, class: createClassName([
                    menuStyles.menu,
                    disabled === true || isMenuVisible === false
                        ? menuStyles.hidden
                        : null,
                    top === true
                        ? textboxAutocompleteStyles.top
                        : textboxAutocompleteStyles.bottom
                ]) }, options.map(function (option, index) {
                if (typeof option === 'string') {
                    return h("hr", { key: index, class: menuStyles.optionSeparator });
                }
                if ('header' in option) {
                    return (h("h1", { key: index, class: menuStyles.optionHeader }, option.header));
                }
                return (h("label", { key: index, class: createClassName([
                        menuStyles.optionValue,
                        option.disabled === true
                            ? menuStyles.optionValueDisabled
                            : null,
                        option.disabled !== true && option.id === selectedId
                            ? menuStyles.optionValueSelected
                            : null
                    ]) },
                    h("input", { checked: value === option.value, class: menuStyles.input, disabled: option.disabled === true, onChange: value === option.value ? undefined : handleOptionChange, onClick: value === option.value ? triggerMenuHide : undefined, onMouseMove: handleOptionMouseMove, tabIndex: -1, type: "radio", value: `${option.value}`, [ITEM_ID_DATA_ATTRIBUTE_NAME]: option.id }),
                    option.value === originalValue ? (h("div", { class: menuStyles.checkIcon },
                        h(IconMenuCheckmarkChecked16, null))) : null,
                    option.value));
            })))));
});
function createOptions(options) {
    return options.map(function (option, index) {
        if (typeof option !== 'string' && 'value' in option) {
            const optionValueWithId = {
                ...option,
                id: `${index}`
            };
            return optionValueWithId;
        }
        return option;
    });
}
function filterOptions(options, value, editedValue) {
    if (value === EMPTY_STRING) {
        return options;
    }
    const id = getIdByValue(options, value);
    if (id === INVALID_ID) {
        return options.filter(function (option) {
            if (typeof option !== 'string' && 'value' in option) {
                return doesStringContainSubstring(option.value, value) === true;
            }
            return false;
        });
    }
    if (editedValue === EMPTY_STRING) {
        return options;
    }
    return options.filter(function (option) {
        if (typeof option !== 'string' && 'value' in option) {
            return doesStringContainSubstring(option.value, editedValue) === true;
        }
        return false;
    });
}
function doesStringContainSubstring(string, substring) {
    return string.toLowerCase().indexOf(substring.toLowerCase()) !== -1;
}
function getIdByValue(options, value) {
    for (const option of options) {
        if (typeof option !== 'string' && 'value' in option) {
            if (option.value === value) {
                return option.id;
            }
        }
    }
    return INVALID_ID;
}
function isValidValue(options, value) {
    if (value === EMPTY_STRING) {
        return true;
    }
    for (const option of options) {
        if (typeof option !== 'string' && 'value' in option) {
            if (option.value.toLowerCase().indexOf(value.toLowerCase()) === 0) {
                return true;
            }
        }
    }
    return false;
}
function findOptionValueById(options, id) {
    for (const option of options) {
        if (typeof option !== 'string' && 'id' in option && option.id === id) {
            return option;
        }
    }
    return null;
}
function getIndexById(options, id) {
    let index = 0;
    for (const option of options) {
        if (typeof option !== 'string' && 'id' in option && option.id === id) {
            return index;
        }
        index += 1;
    }
    return -1;
}
function computePreviousId(options, id) {
    if (id === INVALID_ID) {
        const result = findOptionValueAtOrBeforeIndex(options, options.length - 1);
        return result === null ? null : result.id;
    }
    const index = getIndexById(options, id);
    if (index === -1) {
        throw new Error(`No option with \`id\` ${id}`);
    }
    if (index === 0) {
        return null;
    }
    const result = findOptionValueAtOrBeforeIndex(options, index - 1);
    return result === null ? null : result.id;
}
function computeNextId(options, id) {
    if (id === INVALID_ID) {
        const result = findOptionValueAtOrAfterIndex(options, 0);
        return result === null ? null : result.id;
    }
    const index = getIndexById(options, id);
    if (index === -1) {
        throw new Error(`No option with \`id\` ${id}`);
    }
    if (index === options.length - 1) {
        return null;
    }
    const result = findOptionValueAtOrAfterIndex(options, index + 1);
    return result === null ? null : result.id;
}
function findOptionValueAtOrBeforeIndex(options, index) {
    if (index < 0) {
        throw new Error('`index` < 0');
    }
    if (index > options.length - 1) {
        throw new Error('`index` > `options.length` - 1');
    }
    return findLastOptionValue(options.slice(0, index + 1));
}
function findOptionValueAtOrAfterIndex(options, index) {
    if (index < 0) {
        throw new Error('`index` < 0');
    }
    if (index > options.length - 1) {
        throw new Error('`index` > `options.length` - 1');
    }
    return findFirstOptionValue(options.slice(index));
}
function findFirstOptionValue(options) {
    for (const option of options) {
        if (typeof option !== 'string' &&
            'id' in option &&
            option.disabled !== true) {
            return option;
        }
    }
    return null;
}
function findLastOptionValue(options) {
    return findFirstOptionValue(options.slice().reverse());
}
function updateMenuElementMaxHeight(rootElement, menuElement, top) {
    const rootElementTop = rootElement.getBoundingClientRect().top;
    const maxHeight = top === true
        ? rootElementTop - VIEWPORT_MARGIN
        : window.innerHeight -
            rootElementTop -
            rootElement.offsetHeight -
            VIEWPORT_MARGIN;
    menuElement.style.maxHeight = `${maxHeight}px`;
}
//# sourceMappingURL=textbox-autocomplete.js.map