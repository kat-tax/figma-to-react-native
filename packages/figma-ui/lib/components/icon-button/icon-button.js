import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import { createComponent } from '../../utilities/create-component.js';
import { noop } from '../../utilities/no-op.js';
import styles from './icon-button.module.css';
export const IconButton = createComponent(function ({ children, disabled = false, onClick, onKeyDown = noop, propagateEscapeKeyDown = true, ...rest }, ref) {
    const handleKeyDown = useCallback(function (event) {
        onKeyDown(event);
        if (event.key === 'Escape') {
            if (propagateEscapeKeyDown === false) {
                event.stopPropagation();
            }
            event.currentTarget.blur();
        }
    }, [onKeyDown, propagateEscapeKeyDown]);
    return (h("button", { ...rest, ref: ref, class: styles.iconButton, disabled: disabled === true, onClick: onClick, onKeyDown: handleKeyDown, tabIndex: 0 },
        h("div", { class: styles.icon }, children)));
});
//# sourceMappingURL=icon-button.js.map