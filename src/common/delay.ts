type Func = (...args: any[]) => void;

export function debounce<F extends Func>(func: F, delay: number): (...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null;
  return function debounced(...args: Parameters<F>) {
    const context = this;
    if (timeoutId !== null)
      clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
      timeoutId = null;
    }, delay);
  };
}
