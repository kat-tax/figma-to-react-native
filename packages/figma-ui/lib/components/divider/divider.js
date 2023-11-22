import { h } from 'preact';
import { createComponent } from '../../utilities/create-component.js';
import styles from './divider.module.css';
export const Divider = createComponent(function (rest, ref) {
    return h("hr", { ...rest, ref: ref, class: styles.divider });
});
//# sourceMappingURL=divider.js.map