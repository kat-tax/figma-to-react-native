import type {ParseDeclarationOptionsWithValueWarning} from '../types';

/**
 * Parses CSS Grid properties and returns them as strings
 * These values will be handled by the react-native-css-grid component at runtime
 */
export default function parseGrid(value: any, options: ParseDeclarationOptionsWithValueWarning): string | undefined {
  // Handle null/undefined
  if (value == null) {
    return undefined;
  }

  // Simple values that can be directly converted
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return String(value);
  }

  // Handle arrays (for multi-value properties)
  if (Array.isArray(value)) {
    try {
      return value.map(v => parseGrid(v, options)).filter(Boolean).join(' ');
    } catch {
      options.addValueWarning(value);
      return undefined;
    }
  }

  // For complex objects, try to serialize them as CSS strings
  if (typeof value === 'object' && value !== null) {
    // Handle LightningCSS grid line objects
    if (value.type && typeof value.type === 'string') {
      if (value.type === 'line' && typeof value.index === 'number') {
        // Grid line: line number with optional name
        const line = String(value.index);
        return value.name ? `${value.name} ${line}` : line;
      } else if (value.type === 'span' && typeof value.index === 'number') {
        // Grid span: span keyword with number
        const span = `span ${value.index}`;
        return value.name ? `${span} ${value.name}` : span;
      } else if (value.type === 'auto') {
        // Auto placement
        return 'auto';
      }
      // Other types we don't recognize - fall through to warning
    }

    // Check if it has a toString method that might give us a CSS string
    if (typeof value.toString === 'function') {
      const stringValue = value.toString();
      // Only use toString if it's not the default object toString
      if (stringValue !== '[object Object]') {
        return stringValue;
      }
    }

    // Last resort: try JSON.stringify for simple objects
    try {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return undefined;
      }
      // If it's a simple object with string/number values, try to serialize
      const isSimple = keys.every(key => {
        const val = value[key];
        return typeof val === 'string' || typeof val === 'number' || val == null;
      });
      if (isSimple && keys.length <= 3) {
        // For very simple objects, we might be able to reconstruct CSS
        // But this is risky, so we'll still warn
        options.addValueWarning(value);
        return undefined;
      }
    } catch {
      // Fall through to warning
    }

    options.addValueWarning(value);
    return undefined;
  }

  // Fallback for other primitive types
  return String(value);
}
