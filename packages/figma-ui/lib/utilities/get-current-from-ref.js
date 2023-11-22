export function getCurrentFromRef(ref) {
    if (ref.current === null) {
        throw new Error('`ref.current` is `undefined`');
    }
    return ref.current;
}
//# sourceMappingURL=get-current-from-ref.js.map