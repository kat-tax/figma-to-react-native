import {useState, useEffect} from 'react';
import {useGit} from 'interface/providers/Git';
import {computeTextDiff} from 'utils/text-diff';
import * as $ from 'store';

import type {ComponentRoster} from 'types/component';

export type ComponentDiff = [number, number]; // [additions, deletions]
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
        // Skip diffing if git repo is empty
        try {
          git.fs.readdirSync('design');
        } catch (e) {
          setDiffs({});
          return;
        }
        // Diff each component for lines added and removed
        for (const [key, entry] of Object.entries(roster)) {
          try {
            const currentCode = $.component.code(key).get().toString();
            let gitCode = '';
            try {
              const component = roster[key];
              if (component) {
                const gitPath = `design/${component.path}/${component.name}.tsx`;
                gitCode = git.fs.readFileSync(gitPath, 'utf8')?.toString() || '';
              }
            } catch (e) {
              gitCode = '';
            }
            // Calculate diff using the text-diff utility
            if (currentCode !== gitCode) {
              console.log('>> [git-diff]', entry.path, currentCode.length, gitCode.length);
              const changes = computeTextDiff(gitCode, currentCode);
              let additions = 0;
              let deletions = 0;
              // Parse diff results to count added and removed lines
              for (const change of changes) {
                const originalLines = change.original.endLineNumberExclusive - change.original.startLineNumber;
                const modifiedLines = change.modified.endLineNumberExclusive - change.modified.startLineNumber;
                // Lines added = new lines that weren't in original
                if (modifiedLines > originalLines) {
                  additions += modifiedLines - originalLines;
                }
                // Lines deleted = original lines that aren't in modified
                if (originalLines > modifiedLines) {
                  deletions += originalLines - modifiedLines;
                }
              }
              newDiffs[key] = [additions, deletions];
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
  }, [git, roster]);

  return diffs;
}
