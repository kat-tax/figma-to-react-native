import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import { createClassName } from '../../utilities/create-class-name.js';
import { createComponent } from '../../utilities/create-component.js';
import { noop } from '../../utilities/no-op.js';
import { LoadingIndicator } from '../loading-indicator/loading-indicator.js';
import styles from './button.module.css';
export const Button = createComponent(function ({ children, danger = false, disabled = false, fullWidth = false, loading = false, onClick = noop, onKeyDown = noop, propagateEscapeKeyDown = true, secondary = false, ...rest }, ref) {
    const handleKeyDown = useCallback(function (event) {
        onKeyDown(event);
        if (event.key === 'Escape') {
            if (propagateEscapeKeyDown === false) {
                event.stopPropagation();
            }
            event.currentTarget.blur();
        }
    }, [onKeyDown, propagateEscapeKeyDown]);
    return (h("div", { class: createClassName([
            styles.button,
            secondary === true ? styles.secondary : styles.initial,
            danger === true ? styles.danger : null,
            fullWidth === true ? styles.fullWidth : null,
            disabled === true ? styles.disabled : null,
            loading === true ? styles.loading : null
        ]) },
        loading === true ? (h("div", { class: styles.loadingIndicator },
            h(LoadingIndicator, null))) : null,
        h("button", { ...rest, ref: ref, disabled: disabled === true, onClick: loading === true ? undefined : onClick, onKeyDown: handleKeyDown, tabIndex: 0 },
            h("div", { class: styles.children }, children))));
});
//# sourceMappingURL=button.js.map