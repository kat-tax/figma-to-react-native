import {useState, useEffect} from 'react';
import {Button, Text, Flex} from 'figma-kit';
import {useGit} from 'interface/providers/Git';
import {StatusBar} from 'interface/base/StatusBar';
import {emit} from '@create-figma-plugin/utilities';

import type {EventNotify, EventProjectExport} from 'types/events';
import type {SettingsData} from 'interface/hooks/useUserSettings';

interface GitToolbarProps {
  settings: SettingsData;
}

export function GitToolbar({settings}: GitToolbarProps) {
  const git = useGit();
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [changedFiles, setChangedFiles] = useState<number>(0);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Check for changes periodically
  useEffect(() => {
    const checkChanges = async () => {
      try {
        // Simulate changes detection with file count
        const hasUncommittedChanges = Math.random() > 0.7; // Simulate random changes
        const fileCount = hasUncommittedChanges ? Math.floor(Math.random() * 5) + 1 : 0;
        setHasChanges(hasUncommittedChanges);
        setChangedFiles(fileCount);
      } catch (error) {
        console.error('Error checking git changes:', error);
        setHasChanges(false);
        setChangedFiles(0);
      }
    };

    checkChanges();
    const interval = setInterval(checkChanges, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);


  const handlePublish = async () => {
    if (!settings.config?.git?.repo || !settings.config?.git?.branch || !settings.config?.git?.accessToken) {
      emit<EventNotify>('NOTIFY', 'Git configuration incomplete', {timeout: 3000});
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

  const isConfigured = settings.config?.git?.repo && settings.config?.git?.branch && settings.config?.git?.accessToken;

  if (!isConfigured) {
    return null; // Don't show toolbar if git is not configured
  }

  return (
    <>
      {/* Status bar - only show when there are changes */}
      {hasChanges && (
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
      )}
    </>
  );
}
