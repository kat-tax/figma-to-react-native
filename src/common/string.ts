export function camelCase(val: string) {
	return val.replace(/[_.-](\w|$)/g, function (_, x) {
		return x.toUpperCase();
	});
}
