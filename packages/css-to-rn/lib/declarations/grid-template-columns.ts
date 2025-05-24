import parseUnparsed from './unparsed';
import type {ParseDeclarationOptionsWithValueWarning} from '../types';

/**
 * Converts CSS grid-template-columns to a fake React Native property
 * that can be used to configure react-native-flexible-grid's maxColumnRatioUnits
 */
export default (value: any, options: ParseDeclarationOptionsWithValueWarning) => {
  // Handle grid-template-columns as a string and parse it for column count

  // Try to handle typed values first
  if (value && typeof value === 'object') {
    if (value.type === 'none') {
      // grid-template-columns: none -> default to 12 column grid
      return 12;
    }

    if (value.type === 'track-list' && value.value) {
      const trackList = value.value;
      let columnCount = 0;

      // Count the number of track definitions
      for (const track of trackList) {
        if (track.type === 'track-size') {
          columnCount++;
        } else if (track.type === 'track-repeat') {
          // Handle repeat() functions like repeat(3, 1fr)
          if (track.value && track.value.type === 'number') {
            const repeatCount = track.value.count;
            // Each repeat adds the number of tracks in the repeat pattern
            columnCount += repeatCount * (track.value.trackList?.length || 1);
          } else if (track.value && (track.value.type === 'auto-fill' || track.value.type === 'auto-fit')) {
            // For auto-fill/auto-fit, we can't determine exact count
            // Default to a reasonable grid size
            columnCount += 4; // Reasonable default for responsive grid
          }
        }
      }

      return Math.max(1, columnCount);
    }

    if (value.type === 'subgrid') {
      // Subgrid inherits from parent, default to 12
      return 12;
    }
  }

  // Fallback to string parsing for unparsed values
  if (typeof value === 'string') {
    return parseGridTemplateColumnsString(value);
  }

  // If it's a complex unparsed value, try to parse it
  const unparsedResult = parseUnparsed(value, options);
  if (typeof unparsedResult === 'string') {
    return parseGridTemplateColumnsString(unparsedResult);
  }

  // Fallback for any unhandled cases
  options.addValueWarning(value);
  return 12;
}

/**
 * Advanced string-based parser for grid-template-columns
 * Handles complex CSS Grid template patterns and converts them to column counts
 * suitable for react-native-flexible-grid's maxColumnRatioUnits
 */
function parseGridTemplateColumnsString(value: string): number {
  if (value === 'none' || !value.trim()) {
    return 12; // Default grid system
  }

  // Normalize the value - remove extra whitespace
  const normalized = value.trim().replace(/\s+/g, ' ');

  // Handle repeat() functions with various patterns:
  // repeat(3, 1fr) -> 3 columns
  // repeat(auto-fit, minmax(200px, 1fr)) -> 4 columns (reasonable default)
  // repeat(auto-fill, 100px) -> 6 columns (reasonable default)
  const repeatMatches = normalized.match(/repeat\s*\(\s*([^,]+)\s*,\s*([^)]+)\)/g);
  if (repeatMatches) {
    let totalColumns = 0;

    for (const match of repeatMatches) {
      const repeatContent = match.match(/repeat\s*\(\s*([^,]+)\s*,\s*([^)]+)\)/);
      if (repeatContent) {
        const [, count, pattern] = repeatContent;

        // Handle numeric repeat counts
        if (/^\d+$/.test(count.trim())) {
          const repeatCount = parseInt(count.trim(), 10);
          // Count patterns in the repeat
          const patternCount = countColumnPatterns(pattern);
          totalColumns += repeatCount * patternCount;
        }
        // Handle auto-fit and auto-fill
        else if (count.trim() === 'auto-fit' || count.trim() === 'auto-fill') {
          // For responsive grids, use a reasonable default
          if (pattern.includes('minmax')) {
            totalColumns += 4; // Good default for responsive design
          } else {
            totalColumns += 6; // Default for simpler auto patterns
          }
        }
      }
    }

    // Process any remaining non-repeat columns
    const withoutRepeats = normalized.replace(/repeat\s*\([^)]+\)/g, '').trim();
    if (withoutRepeats) {
      totalColumns += countColumnPatterns(withoutRepeats);
    }

    return Math.max(1, totalColumns);
  }

  // No repeat functions, count explicit column definitions
  return Math.max(1, countColumnPatterns(normalized));
}

/**
 * Count the number of column patterns in a grid template string
 * Handles various CSS Grid sizing functions: fr, px, %, auto, min-content, max-content, minmax(), fit-content()
 */
function countColumnPatterns(pattern: string): number {
  if (!pattern || !pattern.trim()) {
    return 0;
  }

  // Remove grid line names in brackets [name]
  let cleaned = pattern.replace(/\[[^\]]*\]/g, ' ');

  // Handle nested functions like minmax(100px, 1fr) as single units
  // Replace function calls with placeholders
  let processed = cleaned;
  const functions = ['minmax', 'fit-content', 'clamp'];

  for (const func of functions) {
    const regex = new RegExp(`${func}\\s*\\([^)]*\\)`, 'g');
    processed = processed.replace(regex, 'FUNC_PLACEHOLDER');
  }

  // Split by whitespace and count valid column definitions
  const parts = processed.split(/\s+/).filter(part => {
    const trimmed = part.trim();
    return trimmed &&
           trimmed !== '' &&
           // Valid column sizing values
           (trimmed === 'auto' ||
            trimmed === 'min-content' ||
            trimmed === 'max-content' ||
            trimmed === 'FUNC_PLACEHOLDER' ||
            /^\d+(\.\d+)?(fr|px|em|rem|%|vh|vw|vmin|vmax)$/.test(trimmed) ||
            /^\d+(\.\d+)?$/.test(trimmed)); // Numbers without units
  });

  return parts.length;
}
