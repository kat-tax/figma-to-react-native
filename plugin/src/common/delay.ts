export function wait(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export function throttle(func: Function, delay: number) {
  let timeout: number | null = null;
  let lastArgs: any[] = [];

  const execute = () => {
    func.apply(null, lastArgs);
    timeout = null;
  };

  return function (...args: any[]) {
    lastArgs = args;
    if (!timeout) {
      timeout = setTimeout(execute, delay) as unknown as number;
    }
  };
}

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
