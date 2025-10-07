import {Select, IconButton, Flex} from 'figma-kit';
import {useState} from 'react';
import {useGit} from 'interface/providers/Git';
import {IconGitHub} from 'interface/extra/icons/GitHub';
import {UpgradeButton} from 'interface/extra/UpgradeButton';
import {ProjectGitDialog} from './ProjectGitDialog';

import type {SettingsData} from 'interface/hooks/useUserSettings';
import type {Navigation} from 'interface/hooks/useNavigation';

interface ProjectGitButtonProps {
  settings: SettingsData;
  nav?: Navigation;
}

export function ProjectGitButton({settings, nav}: ProjectGitButtonProps) {
  const git = useGit();
  const [showGitDialog, setShowGitDialog] = useState<boolean>(false);
  const hasBranches = git.branches.length > 0;
  const isPremium = settings.config?.projectToken?.length === 40;
  const isConfigured = settings.config?.git?.repo
    && settings.config?.git?.branch
    && settings.config?.git?.accessToken;

  return (
    <>
      {!isPremium && (
        <Flex align="center" gap="small" className="git-config-button">
          <UpgradeButton nav={nav}/>
        </Flex>
      )}
      {(!isConfigured || !hasBranches) && isPremium && (
        <Flex align="center" gap="small" className="git-config-button">
          <IconButton
            aria-label="Configure Git"
            size="small"
            onClick={() => setShowGitDialog(true)}>
            <div style={{transform: 'scale(0.8)'}}>
              <IconGitHub color="secondary"/>
            </div>
          </IconButton>
        </Flex>
      )}
      {isConfigured && hasBranches && isPremium && (
        <Flex align="center" gap="small" className="git-branch-dropdown">
          <Select.Root
            value={git.branch ?? settings.config?.git?.branch}
            onValueChange={(value) => {
              if (value === 'configure') {
                setShowGitDialog(true);
              } else {
                git.changeBranch(value);
              }
            }}>
            <Select.Trigger/>
            <Select.Content>
              {git.branches.map((branch) => (
                <Select.Item key={branch} value={branch}>
                  {branch}
                </Select.Item>
              ))}
              <Select.Separator/>
              <Select.Item value="configure">
                configure...
              </Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
      )}
      <ProjectGitDialog
        settings={settings}
        open={showGitDialog}
        onOpenChange={setShowGitDialog}
      />
    </>
  );
}
