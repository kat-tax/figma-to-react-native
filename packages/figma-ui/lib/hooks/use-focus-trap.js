import { useEffect } from 'preact/hooks';
import { createFocusTrapKeyDownHandler } from '../utilities/private/create-focus-trap-key-down-handler';
export function useFocusTrap(rootElement) {
    useEffect(function () {
        const handleKeyDown = createFocusTrapKeyDownHandler(rootElement);
        window.addEventListener('keydown', handleKeyDown);
        return function () {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [rootElement]);
}
//# sourceMappingURL=use-focus-trap.js.map