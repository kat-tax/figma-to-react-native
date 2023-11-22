import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import { IconControlCheckboxChecked12 } from '../../icons/icon-12/icon-control-checkbox-checked-12.js';
import { createClassName } from '../../utilities/create-class-name.js';
import { createComponent } from '../../utilities/create-component.js';
import { noop } from '../../utilities/no-op.js';
import styles from './checkbox.module.css';
export const Checkbox = createComponent(function ({ children, disabled = false, onChange = noop, onKeyDown = noop, onValueChange = noop, propagateEscapeKeyDown = true, value, ...rest }, ref) {
    const handleChange = useCallback(function (event) {
        onChange(event);
        const newValue = event.currentTarget.checked === true;
        onValueChange(newValue);
    }, [onChange, onValueChange]);
    const handleKeyDown = useCallback(function (event) {
        onKeyDown(event);
        if (event.key === 'Escape') {
            if (propagateEscapeKeyDown === false) {
                event.stopPropagation();
            }
            event.currentTarget.blur();
        }
    }, [onKeyDown, propagateEscapeKeyDown]);
    return (h("label", { class: createClassName([
            styles.checkbox,
            disabled === true ? styles.disabled : null
        ]) },
        h("input", { ...rest, ref: ref, checked: value === true, class: styles.input, disabled: disabled === true, onChange: handleChange, onKeyDown: handleKeyDown, tabIndex: 0, type: "checkbox" }),
        h("div", { class: styles.fill }, value === true ? (h("div", { class: styles.checkIcon },
            h(IconControlCheckboxChecked12, null))) : null),
        h("div", { class: styles.border }),
        h("div", { class: styles.children }, children)));
});
//# sourceMappingURL=checkbox.js.map