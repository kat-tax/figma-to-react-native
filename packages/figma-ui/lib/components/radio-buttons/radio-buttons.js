import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import { Stack } from '../../layout/stack/stack.js';
import { createClassName } from '../../utilities/create-class-name.js';
import { createComponent } from '../../utilities/create-component.js';
import { noop } from '../../utilities/no-op.js';
import { ITEM_ID_DATA_ATTRIBUTE_NAME } from '../../utilities/private/constants.js';
import styles from './radio-buttons.module.css';
export const RadioButtons = createComponent(function ({ disabled = false, onChange = noop, onKeyDown = noop, onValueChange = noop, options, propagateEscapeKeyDown = true, space = 'small', value, ...rest }, ref) {
    const handleChange = useCallback(function (event) {
        onChange(event);
        const id = event.currentTarget.getAttribute(ITEM_ID_DATA_ATTRIBUTE_NAME);
        if (id === null) {
            throw new Error('`id` is `null`');
        }
        const newValue = options[parseInt(id, 10)].value;
        onValueChange(newValue);
    }, [onChange, onValueChange, options]);
    const handleKeyDown = useCallback(function (event) {
        onKeyDown(event);
        if (event.key === 'Escape') {
            if (propagateEscapeKeyDown === false) {
                event.stopPropagation();
            }
            event.currentTarget.blur();
        }
    }, [onKeyDown, propagateEscapeKeyDown]);
    return (h("div", { ref: ref, class: styles.radioButtons },
        h(Stack, { space: space }, options.map(function (option, index) {
            const children = typeof option.children === 'undefined'
                ? `${option.value}`
                : option.children;
            const isOptionDisabled = disabled === true || option.disabled === true;
            return (h("label", { key: index, class: createClassName([
                    styles.label,
                    isOptionDisabled === true ? styles.disabled : null
                ]) },
                h("input", { ...rest, checked: value === option.value, class: styles.input, disabled: isOptionDisabled === true, onChange: handleChange, onKeyDown: handleKeyDown, tabIndex: 0, type: "radio", value: `${option.value}`, [ITEM_ID_DATA_ATTRIBUTE_NAME]: `${index}` }),
                h("div", { class: styles.fill }),
                h("div", { class: styles.border }),
                h("div", { class: styles.children }, children)));
        }))));
});
//# sourceMappingURL=radio-buttons.js.map