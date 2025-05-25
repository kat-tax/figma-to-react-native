import type {ParseDeclarationOptionsWithValueWarning} from '../types';

/**
 * Converts CSS grid-template-areas to a format suitable for react-native-flexible-grid
 * Parses grid area definitions and converts them to a structured format
 */
export default (value: any, options: ParseDeclarationOptionsWithValueWarning) => {
  if (!value) {
    return null;
  }

  // Handle string values (most common case)
  if (typeof value === 'string') {
    return parseGridTemplateAreasString(value);
  }

  // Handle typed values
  if (value && typeof value === 'object') {
    if (value.type === 'none') {
      return null;
    }

    // Convert to string and parse
    const stringValue = String(value);
    return parseGridTemplateAreasString(stringValue);
  }

  // Fallback
  options.addValueWarning(value);
  return null;
}

/**
 * Parse grid-template-areas string into a structured format
 * Example:
 * "header header header"
 * "sidebar main main"
 * "footer footer footer"
 *
 * Converts to: {
 *   areas: ['header', 'sidebar', 'main', 'footer'],
 *   grid: [
 *     ['header', 'header', 'header'],
 *     ['sidebar', 'main', 'main'],
 *     ['footer', 'footer', 'footer']
 *   ],
 *   rows: 3,
 *   columns: 3
 * }
 */
function parseGridTemplateAreasString(value: string): any {
  if (value === 'none' || !value.trim()) {
    return null;
  }

  // Split into rows and clean up
  const rows = value
    .split('\n')
    .map(row => row.trim())
    .filter(row => row.length > 0)
    .map(row => {
      // Remove quotes and split by whitespace
      return row
        .replace(/['"]/g, '')
        .split(/\s+/)
        .filter(cell => cell.length > 0);
    });

  if (rows.length === 0) {
    return null;
  }

  // Extract unique area names
  const areas = new Set<string>();
  rows.forEach(row => {
    row.forEach(cell => {
      if (cell !== '.') {
        areas.add(cell);
      }
    });
  });

  // Calculate grid dimensions
  const rowCount = rows.length;
  const columnCount = Math.max(...rows.map(row => row.length));

  return {
    areas: Array.from(areas),
    grid: rows,
    rows: rowCount,
    columns: columnCount,
    stringValue: value
  };
}
