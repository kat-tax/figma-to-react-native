import { h } from 'preact';
import { createComponent } from '../../utilities/create-component.js';
import style from './preview.module.css';
export const Preview = createComponent(function ({ children, ...rest }, ref) {
    return (h("div", { ...rest, ref: ref, class: style.preview }, children));
});
//# sourceMappingURL=preview.js.map