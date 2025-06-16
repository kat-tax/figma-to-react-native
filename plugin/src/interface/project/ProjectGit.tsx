import {useState} from 'react';
import {Flex, Text, Input, Button, Dialog} from 'figma-kit';
import {VerticalSpace} from 'interface/figma/ui/vertical-space';
import {IconHelp} from 'interface/figma/icons/16/Help';
import {F2RN_EXO_REPO_URL} from 'config/consts';
import {emit} from '@create-figma-plugin/utilities';

import type {ProjectConfig} from 'types/project';
import type {UserSettings} from 'types/settings';
import type {EventProjectExport} from 'types/events';

interface ProjectGitProps {
  project: ProjectConfig;
  settings: UserSettings;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ProjectGit({project, settings, onOpenChange, open}: ProjectGitProps) {
  const [gitKey, setGitKey] = useState(project.gitKey || '');
  const [gitRepo, setGitRepo] = useState(project.gitRepo || '');
  const [gitBranch, setGitBranch] = useState(project.gitBranch || '');

  const handleSave = () => {
    const updatedProject = {
      ...project,
      gitRepo,
      gitBranch,
      gitKey,
    };
    emit<EventProjectExport>('PROJECT_EXPORT', {method: 'git'}, updatedProject, settings);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Content
          width="100%"
          maxWidth={300}
          style={{
            top: 53,
            right: 0,
            left: 'auto',
            transform: 'initial',
            zIndex: 99999,
          }}>
          <Dialog.Header>
            <Dialog.Title>Git Configuration</Dialog.Title>
            <Dialog.Controls>
              <Dialog.Close className="dialog-close"/>
            </Dialog.Controls>
          </Dialog.Header>
          <Dialog.Section>
            <Flex direction="column" gap="medium">
              <Flex align="center">
                <Text weight="strong">Repository</Text>
              </Flex>
              <VerticalSpace space="small"/>
              <Input
                type="text"
                value={gitRepo}
                placeholder={F2RN_EXO_REPO_URL}
                onChange={(e) => setGitRepo(e.target.value)}
              />
              <VerticalSpace space="large"/>
              <Flex align="center">
                <Text weight="strong">Branch</Text>
              </Flex>
              <VerticalSpace space="small"/>
              <Input
                type="text"
                value={gitBranch}
                placeholder="master"
                onChange={(e) => setGitBranch(e.target.value)}
              />
              <VerticalSpace space="large"/>
              <Flex align="center">
                <Text weight="strong">Token</Text>
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noreferrer"
                  style={{marginLeft: '4px'}}>
                  <IconHelp color="brand"/>
                </a>
              </Flex>
              <VerticalSpace space="small"/>
              <Input
                type="password"
                value={gitKey}
                placeholder="Your GitHub Personal Access Token"
                onChange={(e) => setGitKey(e.target.value)}
                onFocus={(e) => {
                  e.target.type = 'text';
                  e.target.select();
                }}
                onBlur={(e) => {
                  e.target.type = 'password';
                }}
              />
              <VerticalSpace space="large"/>
              <Button
                variant="primary"
                onClick={handleSave}>
                Save
              </Button>
            </Flex>
          </Dialog.Section>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
