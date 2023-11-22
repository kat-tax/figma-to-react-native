export function isKeyCodeCharacterGenerating(keyCode) {
    return (keyCode === 32 ||
        (keyCode >= 48 && keyCode <= 57) ||
        (keyCode >= 65 && keyCode <= 90) ||
        (keyCode >= 96 && keyCode <= 105) ||
        (keyCode >= 186 && keyCode <= 192) ||
        (keyCode >= 219 && keyCode <= 222));
}
//# sourceMappingURL=is-keycode-character-generating.js.map