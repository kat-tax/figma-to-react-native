/**
 * Text diffing utility that uses the VSCode diff algorithm to compute changes
 * between two text strings rather than completely replacing content.
 *
 * Uses AdvancedLinesDiffComputer which provides better diff results than the default
 * algorithm, as it attempts to identify the minimal set of changes between texts.
 */

import {DefaultLinesDiffComputer} from 'interface/utils/editor/diff';
import {Text} from 'yjs';

/**
 * Apply diff changes to a Text document (e.g., Yjs Text)
 *
 * @param text The Yjs Text object to modify
 * @param contentOld The original text content
 * @param contentNew The new text content
 * @param transactionOrigin Optional transaction origin for Yjs
 */
export function applyTextDiff(
  text: Text,
  contentNew: string,
  transactionOrigin: string
) {
  const contentOld = text.toString();

  // Don't do anything if texts are identical
  if (contentOld === contentNew) return;

  // Fallback function to use if diff operations fail
  const applyFullReplace = () => {
    try {
      text.doc.transact(() => {
        text.delete(0, text.length);
        text.insert(0, contentNew);
      }, transactionOrigin);
    } catch (error) {
      console.log('>> [text-diff] error during full text replacement:', error);
    }
  };

  try {
    // Compute the diff between original and new content
    const changes = computeTextDiff(contentOld, contentNew);
    // If there are no changes, exit early
    if (changes.length === 0) return;
    // Process the changes within a transaction
    try {
      text.doc.transact(() => {
        // Split into lines for processing
        const originalLines = splitLines(contentOld);
        const newLines = splitLines(contentNew);
        // Track cursor position offset as we make changes
        let offsetTracker = 0;
        // Apply each change
        for (const change of changes) {
          // Calculate positions in the string
          const originalStartLine = change.original.startLineNumber;
          const originalEndLine = change.original.endLineNumberExclusive;
          const modifiedStartLine = change.modified.startLineNumber;
          const modifiedEndLine = change.modified.endLineNumberExclusive;
          // Calculate positions in the string (1-based line numbers to 0-based index)
          const startPos = getPosition(originalLines, originalStartLine - 1);
          let endPos = originalStartLine === originalEndLine
            ? startPos
            : getPosition(originalLines, originalEndLine - 1);
          // Apply the current offset (needed because previous operations affected positions)
          const actualStartPos = startPos + offsetTracker;
          const actualEndPos = endPos + offsetTracker;
          // Calculate the content to insert
          let insertContent = '';
          if (modifiedEndLine > modifiedStartLine) {
            // Convert 1-based line numbers to 0-based indexes for array access
            const startIdx = modifiedStartLine - 1;
            const endIdx = modifiedEndLine - 1;
            if (startIdx >= 0 && endIdx <= newLines.length) {
              insertContent = newLines.slice(startIdx, endIdx).join('\n');
              // Add a newline at the end if not at end of document and not already there
              const isEndOfDocument = endIdx === newLines.length;
              if (!isEndOfDocument && !insertContent.endsWith('\n')) {
                insertContent += '\n';
              }
            }
          }
          // Update the offset tracker based on this change
          const deleteLength = actualEndPos - actualStartPos;
          offsetTracker = offsetTracker - deleteLength + insertContent.length;
          // Delete the original range and insert the new content with bounds checking
          if (deleteLength > 0 && actualStartPos >= 0 && actualStartPos + deleteLength <= text.length) {
            try {
              text.delete(actualStartPos, deleteLength);
            } catch (error) {
              console.log('>> [diff] Error during text deletion:', error);
              throw error; // Rethrow to trigger fallback
            }
          }
          if (insertContent.length > 0 && actualStartPos >= 0 && actualStartPos <= text.length) {
            try {
              text.insert(actualStartPos, insertContent);
            } catch (error) {
              console.log('>> [diff] Error during text insertion:', error);
              throw error; // Rethrow to trigger fallback
            }
          }
        }
      }, transactionOrigin);
    } catch (error) {
      console.log('>> [text-diff] error applying text diffs:', error);
      applyFullReplace();
    }
  } catch (error) {
    console.log('>> [text-diff] error during diff computation:', error);
    applyFullReplace();
  }
}

/**
 * Apply a text diff to the original text using VSCode's diff algorithm
 *
 * @param originalText The original text content
 * @param newText The new text content to compare against
 * @returns An array of operations to apply to transform originalText into newText
 */
export function computeTextDiff(originalText: string, newText: string) {
  // Create an instance of the AdvancedLinesDiffComputer
  const diffComputer = new DefaultLinesDiffComputer();

  // Split texts into lines for the diffing algorithm
  const originalLines = splitLines(originalText);
  const newLines = splitLines(newText);

  // Compute the differences between the two texts
  const result = diffComputer.computeDiff(originalLines, newLines, {
    // These are the default settings, can be customized if needed
    ignoreTrimWhitespace: false,
    maxComputationTimeMs: 3000,
    computeMoves: true,
  });

  return result.changes;
}


/**
 * Calculate character position in a string based on line number
 */
function getPosition(lines: string[], lineNumber: number): number {
  if (lineNumber < 0)
    return 0;
  if (lineNumber >= lines.length)
    lineNumber = lines.length - 1;
  let position = 0;
  for (let i = 0; i < lineNumber; i++)
    position += (lines[i]?.length ?? 0) + 1; // (+1 for the newline character)
  return position;
}

/**
 * Split a string into lines
 */
function splitLines(text: string): string[] {
  return text.split(/\r\n|\r|\n/);
}
