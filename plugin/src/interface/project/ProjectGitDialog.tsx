import {useRef} from 'react';
import {Flex, Text, Input, Button, Dialog} from 'figma-kit';
import {VerticalSpace} from 'interface/figma/ui/vertical-space';
import {IconHelp} from 'interface/figma/icons/16/Help';
import {F2RN_EXO_REPO_URL} from 'config/consts';

import type {SettingsData} from 'interface/hooks/useUserSettings';

interface ProjectGitDialogProps {
  settings: SettingsData;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ProjectGitDialog({settings, onOpenChange, open}: ProjectGitDialogProps) {
  const repoInput = useRef<HTMLInputElement>(null);
  const branchInput = useRef<HTMLInputElement>(null);
  const accessTokenInput = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        <Dialog.Overlay/>
        <Dialog.Content
          placement="center"
          maxWidth={300}>
          <Dialog.Header>
            <Dialog.Title>Git Configuration</Dialog.Title>
            <Dialog.Controls>
              <Dialog.Close className="dialog-close"/>
            </Dialog.Controls>
          </Dialog.Header>
          <Dialog.Section>
            <form onSubmit={handleSubmit}>
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
                    href="https://github.com/settings/personal-access-tokens"
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
                  placeholder="personal access token"
                  onFocus={(e) => {
                    e.target.type = 'text';
                    e.target.select();
                  }}
                  onBlur={(e) => {
                    e.target.type = 'password';
                  }}
                />
                <VerticalSpace space="small"/>
                <Text size="small">
                  Fine-grained tokens must have permissions:
                  <ul style={{margin: 4, paddingLeft: '16px'}}>
                    <li>Metadata: Read-only</li>
                    <li>Contents: Read and Write</li>
                  </ul>
                </Text>
                <VerticalSpace space="large"/>
                <Flex justify="end" gap="1">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary">
                    Save
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Dialog.Section>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
