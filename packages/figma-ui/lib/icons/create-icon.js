import { h } from 'preact';
import { createComponent } from '../utilities/create-component.js';
import styles from './icon.module.css';
export function createIcon(path, options) {
    const { width, height } = options;
    return createComponent(function ({ color, ...rest }) {
        return (h("svg", { ...rest, class: styles.icon, height: height, style: {
                fill: typeof color === 'undefined'
                    ? 'currentColor'
                    : `var(--figma-color-icon-${color})`
            }, width: width, xmlns: "http://www.w3.org/2000/svg" },
            h("path", { "clip-rule": "evenodd", d: path, "fill-rule": "evenodd" })));
    });
}
//# sourceMappingURL=create-icon.js.map