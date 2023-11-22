import { h } from 'preact';
import { createComponent } from '../../utilities/create-component.js';
import styles from './middle-align.module.css';
export const MiddleAlign = createComponent(function ({ children, ...rest }, ref) {
    return (h("div", { ...rest, ref: ref, class: styles.middleAlign },
        h("div", { class: styles.children }, children)));
});
//# sourceMappingURL=middle-align.js.map