import {useState, useEffect} from 'react';
import {Button, Text, DropdownMenu, IconButton, Flex} from 'figma-kit';
import {useGit} from 'interface/providers/Git';
import {IconGit} from 'interface/figma/icons/24/Git';
import {IconRefresh} from 'interface/figma/icons/24/Refresh';
import {emit} from '@create-figma-plugin/utilities';

import type {EventNotify} from 'types/events';
import type {SettingsData} from 'interface/hooks/useUserSettings';

interface ProjectGitButtonProps {
  settings: SettingsData;
  availableBranches?: string[];
  onBranchChange?: (branch: string) => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'tertiary';
  showRefresh?: boolean;
}

export function ProjectGitButton({
  settings,
  availableBranches = [],
  onBranchChange,
  size = 'small',
  variant = 'secondary',
  showRefresh = false,
}: ProjectGitButtonProps) {

  const git = useGit();
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(git.lastFetchTime);
  const [branches] = useState<string[]>(availableBranches.length > 0 ? availableBranches : ['main', 'develop', 'feature/new-component']);

  const handleBranchChange = (newBranch: string) => {
    if (onBranchChange) {
      onBranchChange(newBranch);
    } else {
      // Default behavior - just show notification
      emit<EventNotify>('NOTIFY', `Switched to branch: ${newBranch}`, {timeout: 3000});
    }
  };

  const handleFetch = async () => {
    try {
      await git.fetch();
      emit<EventNotify>('NOTIFY', 'Repository fetched successfully', {timeout: 3000});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown fetch error';
      emit<EventNotify>('NOTIFY', `Fetch failed: ${errorMessage}`, {timeout: 5000});
    }
  };

  const formatLastFetch = () => {
    if (!lastFetchTime) return 'Never';
    const now = Date.now();
    const diff = now - lastFetchTime;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Sync with git context's lastFetchTime
  useEffect(() => {
    setLastFetchTime(git.lastFetchTime);
  }, [git.lastFetchTime]);

  const branchName = settings.config?.git?.branch || 'main';
  const isConfigured = settings.config?.git?.repo && settings.config?.git?.branch && settings.config?.git?.accessToken;

  if (!isConfigured) {
    return null; // Don't show button if git is not configured
  }

  return (
    <Flex align="center" gap="small">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            size={size}
            variant={variant}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px'
            }}>
            <IconGit size={16}/>
            <Text size="small" weight="medium">
              {branchName}
            </Text>
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {branches.map((branch) => (
            <DropdownMenu.Item
              key={branch}
              onSelect={() => handleBranchChange(branch)}>
              <Text>{branch}</Text>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      {showRefresh && (
        <IconButton
          size="small"
          aria-label={`Last fetch: ${formatLastFetch()}`}
          onClick={handleFetch}
          disabled={git.isFetching}>
          <div className={git.isFetching ? 'rotate' : ''}>
            <IconRefresh
              color={git.isFetching ? 'disabled' : 'secondary'}
            />
          </div>
        </IconButton>
      )}
    </Flex>
  );
}
