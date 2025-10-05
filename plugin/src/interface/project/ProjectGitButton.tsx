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
  showRefresh?: boolean;
}

export function ProjectGitButton({
  settings,
  availableBranches = [],
  onBranchChange,
  showRefresh = false,
}: ProjectGitButtonProps) {

  const git = useGit();
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(git.lastFetchTime);
  const [branches, setBranches] = useState<string[]>(availableBranches.length > 0 ? availableBranches : []);

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
      // Branches are automatically fetched in the git provider after fetch
      setBranches(git.branches);
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

  // Fetch branches when component mounts or when git context changes
  useEffect(() => {
    const fetchBranches = async () => {
      if (git.branches.length > 0) {
        setBranches(git.branches);
      } else {
        try {
          const branchList = await git.listBranches();
          setBranches(branchList);
        } catch (error) {
          console.error('Failed to fetch branches:', error);
          // Fallback to availableBranches if provided, otherwise show empty
          if (availableBranches.length > 0) {
            setBranches(availableBranches);
          }
        }
      }
    };

    fetchBranches();
  }, [git.branches, git.listBranches, availableBranches]);

  const branchName = settings.config?.git?.branch || 'main';
  const isConfigured = settings.config?.git?.repo && settings.config?.git?.branch && settings.config?.git?.accessToken;

  if (!isConfigured) {
    return null; // Don't show button if git is not configured
  }

  return (
    <Flex align="center" gap="small" style={{position: 'absolute', right: 0}}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button size="small" variant="secondary">
            <div style={{transform: 'scale(0.8)'}}>
              <IconGit size={24}/>
            </div>
              {branchName}
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
