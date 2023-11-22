import { useEffect } from 'preact/hooks';
import { getCurrentFromRef } from '../utilities/get-current-from-ref';
export function useMouseDownOutside(options) {
    const { ref, onMouseDownOutside } = options;
    useEffect(function () {
        function handleBlur() {
            onMouseDownOutside();
        }
        function handleMouseDown(event) {
            const element = getCurrentFromRef(ref);
            if (element === event.target ||
                element.contains(event.target)) {
                return;
            }
            onMouseDownOutside();
        }
        window.addEventListener('blur', handleBlur);
        window.addEventListener('mousedown', handleMouseDown);
        return function () {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, [ref, onMouseDownOutside]);
}
//# sourceMappingURL=use-mouse-down-outside.js.map