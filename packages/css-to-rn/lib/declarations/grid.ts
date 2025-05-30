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
    // Handle LightningCSS grid structures
    if (value.type && typeof value.type === 'string') {
      try {
        return parseGridValue(value);
      } catch {
        // If parsing fails, fall through to warning
      }
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

/**
 * Parse LightningCSS grid value objects into CSS strings
 */
function parseGridValue(value: any): string {
  if (!value || typeof value !== 'object' || !value.type) {
    throw new Error('Invalid grid value');
  }

  switch (value.type) {
    case 'line':
      // Grid line number with optional name
      const line = String(value.index || 1);
      return value.name ? `${value.name} ${line}` : line;

    case 'span':
      // Grid span keyword with number
      const span = `span ${value.index || 1}`;
      return value.name ? `${span} ${value.name}` : span;

    case 'auto':
      return 'auto';

    case 'track-list':
      // Grid template with track list
      const items = value.items || [];
      return items.map((item: any) => parseGridValue(item)).join(' ');

    case 'track-repeat':
      // repeat() function
      const repeatValue = value.value || {};
      const count = repeatValue.count?.value || repeatValue.count || 1;
      const trackSizes = repeatValue.trackSizes || [];
      const tracks = trackSizes.map((track: any) => parseGridValue(track)).join(' ');
      return `repeat(${count}, ${tracks})`;

    case 'track-size':
      // Individual track size - extract the nested value
      return parseGridValue(value.value);

    case 'track-breadth':
      // Track breadth - extract the nested value
      return parseGridValue(value.value);

    case 'min-max':
      // minmax() function
      const min = parseGridValue(value.min);
      const max = parseGridValue(value.max);
      return `minmax(${min}, ${max})`;

    case 'length':
      // Length value (px, em, etc.)
      if (value.value && value.value.type === 'dimension') {
        const dim = value.value.value;
        return `${dim.value}${dim.unit}`;
      }
      return '0';

    case 'flex':
      // Fractional unit (fr)
      return `${value.value || 1}fr`;

    case 'percentage':
      // Percentage value
      return `${value.value || 0}%`;

    case 'dimension':
      // Direct dimension value
      const dimValue = value.value || {};
      return `${dimValue.value || 0}${dimValue.unit || 'px'}`;

    case 'number':
      // Plain number
      return String(value.value || 0);

    case 'keyword':
      // CSS keyword
      return value.value || 'auto';

    default:
      throw new Error(`Unknown grid value type: ${value.type}`);
  }
}
