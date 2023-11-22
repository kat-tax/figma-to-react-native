import { h } from 'preact';
import { createComponent } from '../../utilities/create-component';
import styles from './muted.module.css';
export const Muted = createComponent(({ children, ...rest }, ref) => {
    return (h("span", { ...rest, ref: ref, class: styles.muted }, children));
});
//# sourceMappingURL=muted.js.map