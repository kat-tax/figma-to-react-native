import { h } from 'preact';
import { createComponent } from '../../utilities/create-component';
import styles from './code.module.css';
export const Code = createComponent(({ children, ...rest }, ref) => {
    return (h("code", { ...rest, ref: ref, class: styles.code }, children));
});
//# sourceMappingURL=code.js.map