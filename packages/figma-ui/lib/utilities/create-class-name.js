export function createClassName(classNames) {
    return classNames
        .filter(function (className) {
        return className !== null;
    })
        .join(' ');
}
//# sourceMappingURL=create-class-name.js.map