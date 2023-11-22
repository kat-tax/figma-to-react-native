import { h } from 'preact';
import { createComponent } from '../../utilities/create-component.js';
import styles from './vertical-space.module.css';
export const VerticalSpace = createComponent(function ({ space, ...rest }, ref) {
    return h("div", { ...rest, ref: ref, class: styles[space] });
});
//# sourceMappingURL=vertical-space.js.map