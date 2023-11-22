export function getFocusableElements(rootElement) {
    const elements = (typeof rootElement === 'undefined' ? document : rootElement).querySelectorAll(':not([disabled])[tabindex]:not([tabindex="-1"])');
    return Array.prototype.slice.call(elements);
}
//# sourceMappingURL=get-focusable-elements.js.map