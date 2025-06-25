import {useRef} from 'react';
import {Flex, Text, Input, Button, Dialog} from 'figma-kit';
import {VerticalSpace} from 'interface/figma/ui/vertical-space';
import {IconHelp} from 'interface/figma/icons/16/Help';
import {F2RN_EXO_REPO_URL} from 'config/consts';

import type {SettingsData} from 'interface/hooks/useUserSettings';

interface ProjectGitProps {
  settings: SettingsData;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ProjectGit({settings, onOpenChange, open}: ProjectGitProps) {
  const repoInput = useRef<HTMLInputElement>(null);
  const branchInput = useRef<HTMLInputElement>(null);
  const accessTokenInput = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    settings.update(JSON.stringify({
      ...settings.config,
      git: {
        repo: repoInput.current?.value,
        branch: branchInput.current?.value,
        accessToken: accessTokenInput.current?.value,
      },
    }, undefined, 2), true);
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
                ref={repoInput}
                defaultValue={settings.config?.git?.repo}
                placeholder={F2RN_EXO_REPO_URL}
              />
              <VerticalSpace space="large"/>
              <Flex align="center">
                <Text weight="strong">Branch</Text>
              </Flex>
              <VerticalSpace space="small"/>
              <Input
                type="text"
                ref={branchInput}
                defaultValue={settings.config?.git?.branch}
                placeholder="master"
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
                ref={accessTokenInput}
                defaultValue={settings.config?.git?.accessToken}
                placeholder="Your GitHub Personal Access Token"
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
