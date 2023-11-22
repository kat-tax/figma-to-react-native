import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import { IconMenuCheckmarkChecked16 } from '../../icons/icon-16/icon-menu-checkmark-checked-16.js';
import { createClassName } from '../../utilities/create-class-name.js';
import { createComponent } from '../../utilities/create-component.js';
import { noop } from '../../utilities/no-op.js';
import styles from './selectable-item.module.css';
export const SelectableItem = createComponent(function ({ bold = false, children, disabled = false, indent = false, onChange = noop, onKeyDown = noop, onValueChange = noop, propagateEscapeKeyDown = true, value, ...rest }, ref) {
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
            styles.selectableItem,
            disabled === true ? styles.disabled : null,
            bold === true ? styles.bold : null,
            indent === true ? styles.indent : null
        ]) },
        h("input", { ...rest, ref: ref, checked: value === true, class: styles.input, disabled: disabled === true, onChange: handleChange, onKeyDown: disabled === true ? undefined : handleKeyDown, tabIndex: 0, type: "checkbox" }),
        h("div", { class: styles.box }),
        h("div", { class: styles.children }, children),
        value === true ? (h("div", { class: styles.icon },
            h(IconMenuCheckmarkChecked16, null))) : null));
});
//# sourceMappingURL=selectable-item.js.map