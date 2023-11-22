import { h } from 'preact';
import { createComponent } from '../../utilities/create-component';
import styles from './bold.module.css';
export const Bold = createComponent(({ children, ...rest }, ref) => {
    return (h("strong", { ...rest, ref: ref, class: styles.bold }, children));
});
//# sourceMappingURL=bold.js.map