type Func = (...args: any[]) => void;

export function debounce<F extends Func>(func: F, delay: number): (...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null;

  return function debounced(...args: Parameters<F>) {
    const context = this;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(context, args);
      timeoutId = null;
    }, delay);
  };
}

export function rgbToHex(r: number, g: number, b: number, a?: number) {
  // Convert RGB values to hexadecimal
  const hexValue = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');

  // If an alpha value is provided, add it to the hexadecimal representation
  if (a !== undefined) {
    const alphaValue = Math.round(a * 255).toString(16).padStart(2, '0');
    return `#${hexValue}${alphaValue}`;
  }

  return `#${hexValue}`;
}
