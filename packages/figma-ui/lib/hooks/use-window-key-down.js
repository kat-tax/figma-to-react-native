import { useCallback, useEffect } from 'preact/hooks';
export function useWindowKeyDown(key, onKeyDown) {
    const handleKeyDown = useCallback(function (event) {
        if (event.key !== key) {
            return;
        }
        onKeyDown(event);
    }, [key, onKeyDown]);
    useEffect(function () {
        window.addEventListener('keydown', handleKeyDown);
        return function () {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
}
//# sourceMappingURL=use-window-key-down.js.map