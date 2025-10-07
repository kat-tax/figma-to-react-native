import {useState, useEffect} from 'react';
import {computeTextDiff} from 'utils/text-diff';
import {useGit} from 'interface/providers/Git';
import * as $ from 'store';

import type {ComponentRoster} from 'types/component';

export type ComponentDiff = [number, number | null]; // [additions, deletions]
export type ComponentDiffs = Record<string, ComponentDiff>;

export function useGitDiffs(roster: ComponentRoster): ComponentDiffs {
  const [diffs, setDiffs] = useState<ComponentDiffs>({});
  const git = useGit();

  useEffect(() => {
    let mounted = true;
    const update = async () => {
      try {
        const newDiffs: ComponentDiffs = {};
        // Skip diffing if components are loading
        if (Object.values(roster).some(entry => entry.loading)) {
          setDiffs({});
          return;
        }
        // Skip diffing if git branch is not set
        if (!git?.branch) return;
        // Skip diffing if git repo is empty
        try {
          git.fs.readdirSync('design');
        } catch (e) {
          setDiffs({});
          return;
        }
        // Diff each component for lines added and removed
        for (const [key, entry] of Object.entries(roster)) {
          if (entry.path.includes('/tests/')
            || entry.path.includes('/library/')) continue;
          try {
            const currentCode = $.component.code(key).get().toString();
            let gitCode: string | null = null;
            try {
              const component = roster[key];
              if (component) {
                const gitPath = `design/${component.path}/${component.name}.tsx`;
                gitCode = git.fs.readFileSync(gitPath, 'utf8')?.toString() || '';
              }
            } catch (e) {
              gitCode = null;
            }
            // Calculate diff using the text-diff utility
            if (currentCode !== gitCode) {
              // Handle new files (no git version exists)
              if (gitCode === null) {
                // For new files, count all lines as additions, no deletions (null)
                let currentLines = currentCode.split(/\r\n|\r|\n/).length;
                // Remove the last newline (added by the editor)
                // TODO: look into why output doesn't have the new line
                if (currentLines > 0) currentLines = currentLines - 1;
                newDiffs[key] = [currentLines, null];
              } else {
                const changes = computeTextDiff(gitCode, currentCode);
                let additions = 0;
                let deletions = 0;
                // Parse diff results to count added and removed lines like GitHub
                for (const change of changes) {
                  const originalLines = change.original.endLineNumberExclusive - change.original.startLineNumber;
                  const modifiedLines = change.modified.endLineNumberExclusive - change.modified.startLineNumber;
                  // Count deletions: lines that existed in original but not in modified
                  deletions += originalLines;
                  // Count additions: lines that exist in modified but not in original
                  additions += modifiedLines;
                }
                newDiffs[key] = [additions, deletions];
              }
            } else {
              // No changes
              newDiffs[key] = [0, 0];
            }
          } catch (error) {
            console.error(`Failed to calculate diff for ${key}:`, error);
            newDiffs[key] = [0, 0];
          }
        }
        if (mounted) {
          setDiffs(newDiffs);
        }
      } catch (error) {
        console.error('Failed to calculate git diffs:', error);
        if (mounted) {
          setDiffs({});
        }
      }
    };
    update();
    return () => {mounted = false};
  }, [roster, git.fs, git.branch, git.lastFetchTime]);

  return diffs;
}
