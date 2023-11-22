import { useState, useEffect } from 'preact/hooks';
function isFigmaDark() {
    return document.body.parentElement?.classList.contains('figma-dark') ?? false;
}
export function useDarkMode() {
    const [isDark, setDark] = useState(isFigmaDark());
    useEffect(() => {
        const $ = new MutationObserver(() => {
            setDark(isFigmaDark());
        });
        if (document.body.parentElement) {
            $.observe(document.body.parentElement, {
                attributeFilter: ['class'],
                attributes: true,
                childList: false,
                subtree: false,
            });
        }
        return () => $.disconnect();
    }, []);
    return isDark;
}
//# sourceMappingURL=use-dark-mode.js.map