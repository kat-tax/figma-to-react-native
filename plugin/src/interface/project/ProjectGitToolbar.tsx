import {useState, useEffect} from 'react';
import {Button, Text, Flex} from 'figma-kit';
import {StatusBar} from 'interface/base/StatusBar';
import {emit, on} from '@create-figma-plugin/utilities';
import {useGit} from 'interface/providers/Git';

import type {EventNotify, EventProjectExport, EventProjectRelease} from 'types/events';
import type {SettingsData} from 'interface/hooks/useUserSettings';
import type {ComponentDiffs} from 'interface/hooks/useGitDiffs';

interface ProjectGitToolbarProps {
  diffs: ComponentDiffs;
  settings: SettingsData;
}

export function ProjectGitToolbar({diffs, settings}: ProjectGitToolbarProps) {
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const git = useGit();

  const isConfigured = settings.config?.git?.repo
    && settings.config?.git?.branch
    && settings.config?.git?.accessToken;

  const hasChanges = Object.values(diffs).some(([additions, deletions]) =>
    additions > 0 || (deletions !== null && deletions > 0)
  );
  const changedFiles = Object.values(diffs).filter(([additions, deletions]) =>
    additions > 0 || (deletions !== null && deletions > 0)
  ).length;

  const handlePublish = async () => {
    if (!isConfigured) {
      emit<EventNotify>('NOTIFY', 'Git configuration invalid', {timeout: 3000});
      return;
    }
    setIsPublishing(true);
    try {
      emit<EventProjectExport>('PROJECT_EXPORT', {method: 'git'}, settings.config);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown publish error';
      emit<EventNotify>('NOTIFY', `Publish failed: ${errorMessage}`, {timeout: 5000});
    }
  };

  // Listen for publish completion to switch to new branch
  useEffect(() => on<EventProjectRelease>('PROJECT_RELEASE', async (info, build, settings, form) => {
    if (form.method === 'git' && info && build) {
      try {
        // Extract version from the build to construct the branch name
        const version = info.appConfig?.['General']?.['DESIGN_VERSION']?.toString() || '0.0.1';
        const newBranch = `design-${version}`;
        // Poll for the new branch with timeout
        const pollForBranch = async () => {
          const startTime = Date.now();
          const timeout = 30000; // 30 seconds
          const pollInterval = 2000; // 2 seconds
          while (Date.now() - startTime < timeout) {
            try {
              // Fetch from origin to get latest branches
              await git.fetch();
              // List branches to check if our new branch exists
              const branches = await git.listBranches();
              // Branch found, switch to it
              if (branches.includes(newBranch)) {
                await git.changeBranch(newBranch);
                emit<EventNotify>('NOTIFY', `Switched to branch: ${newBranch}`, {timeout: 3000});
                setIsPublishing(false);
                return;
              }
              // Wait before next poll
              await new Promise(resolve => setTimeout(resolve, pollInterval));
            } catch (error) {
              console.error('>> Error polling for branch:', error);
              await new Promise(resolve => setTimeout(resolve, pollInterval));
            }
            // Reached timeout
            setIsPublishing(false);
          }
        };
        // Start polling
        pollForBranch();
      } catch (error) {
        console.error('Failed to start branch polling:', error);
        emit<EventNotify>('NOTIFY', `Failed to switch branch: ${error instanceof Error ? error.message : 'Unknown error'}`, {error: true, timeout: 5000});
      }
    }
  }), [git]);

  if (!isConfigured || !hasChanges) {
    return null;
  }

  return (
    <StatusBar>
      <Flex align="center" gap="small" style={{flex: 1}}>
        <Text size="medium" weight="medium">
          {changedFiles} file{changedFiles !== 1 ? 's' : ''} changed
        </Text>
      </Flex>
      <Button
        size="small"
        variant="primary"
        onClick={handlePublish}
        disabled={isPublishing}>
        {isPublishing ? 'Publishing...' : 'Publish'}
      </Button>
    </StatusBar>
  );
}
