import {useState} from 'react';
import {Button, Text, Flex} from 'figma-kit';
import {StatusBar} from 'interface/base/StatusBar';
import {emit} from '@create-figma-plugin/utilities';

import type {EventNotify, EventProjectExport} from 'types/events';
import type {SettingsData} from 'interface/hooks/useUserSettings';
import type {ComponentDiffs} from 'interface/hooks/useGitDiffs';

interface GitToolbarProps {
  diffs: ComponentDiffs;
  settings: SettingsData;
}

export function GitToolbar({diffs, settings}: GitToolbarProps) {
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

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
      emit<EventNotify>('NOTIFY', 'Publishing to Git...', {timeout: 3000});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown publish error';
      emit<EventNotify>('NOTIFY', `Publish failed: ${errorMessage}`, {timeout: 5000});
    } finally {
      setIsPublishing(false);
    }
  };

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
