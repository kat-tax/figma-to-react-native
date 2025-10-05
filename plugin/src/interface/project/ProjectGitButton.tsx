import {useState, useEffect} from 'react';
import {Select, IconButton, Flex} from 'figma-kit';
import {useGit} from 'interface/providers/Git';
import {IconRefresh} from 'interface/figma/icons/24/Refresh';
import {emit} from '@create-figma-plugin/utilities';

import type {EventNotify} from 'types/events';
import type {SettingsData} from 'interface/hooks/useUserSettings';

interface ProjectGitButtonProps {
  settings: SettingsData;
  showRefresh?: boolean;
}

export function ProjectGitButton({settings, showRefresh}: ProjectGitButtonProps) {
  const git = useGit();
  const isConfigured = settings.config?.git?.repo
    && settings.config?.git?.branch
    && settings.config?.git?.accessToken;
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(git.lastFetchTime);
  const [branches, setBranches] = useState<string[]>([]);

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
        }
      }
    };

    fetchBranches();
  }, [git.branches, git.listBranches]);


  // Don't show button if git is not configured
  if (!isConfigured || git.branches.length === 0) {
    return null;
  }

  return (
    <Flex align="center" gap="small" className="git-branch-dropdown">
      <Select.Root
        value={git.branch}
        onValueChange={git.changeBranch}>
        <Select.Trigger/>
        <Select.Content>
          {branches.map((branch) => (
            <Select.Item key={branch} value={branch}>
              {branch}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      {showRefresh && (
        <IconButton
          aria-label={`Last fetch: ${formatLastFetch()}`}
          size="small"
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
