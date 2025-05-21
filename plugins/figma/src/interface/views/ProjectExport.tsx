import {emit} from '@create-figma-plugin/utilities';
import {useState, Fragment, useMemo} from 'react';
import {Flex, Text, Input, Button, Checkbox, SegmentedControl} from 'figma-kit';
import {useForm} from 'interface/figma/hooks/use-form';
import {Banner} from 'interface/figma/ui/banner';
import {Container} from 'interface/figma/ui/container';
import {IconButton} from 'interface/figma/ui/icon-button';
import {VerticalSpace} from 'interface/figma/ui/vertical-space';
import {IconHyperlink} from 'interface/figma/icons/32/Hyperlink';
import {IconCheck} from 'interface/figma/icons/32/Check';
import {IconHelp} from 'interface/figma/icons/16/Help';
import {IconWarning} from 'interface/figma/icons/32/Warning';
import {useProjectRelease} from 'interface/hooks/useProjectRelease';
import {useSync} from 'interface/providers/Sync';
import {titleCase} from 'common/string';
import {F2RN_EXO_REPO_URL, F2RN_SERVICE_URL} from 'config/consts';
import {docId} from 'store';

import type {ProjectRelease, ProjectExportMethod, ProjectExportScope} from 'types/project';
import type {EventProjectExport, EventOpenLink} from 'types/events';
import type {ComponentBuild} from 'types/component';

interface ProjectExportProps {
  project: ProjectRelease,
  build: ComponentBuild,
}

export function ProjectExport(props: ProjectExportProps) {
  const [exportCount, setExportCount] = useState(0);
  const [isExporting, setExporting] = useState(false);
  const [hasSuccess, setHasSuccess] = useState(false);
  const [msgFailure, setMsgFailure] = useState('');

  const sync = useSync();
  const form = useForm<ProjectRelease>(props.project, {
    close: () => {},
    validate: (_data) => true,
    submit: (data) => {
      if (data.method === 'sync' && sync.active) {
        sync.disconnect();
        return;
      }
      if (data.method !== 'sync')
        setExporting(true);
      setHasSuccess(false);
      emit<EventProjectExport>('PROJECT_EXPORT', data);
    },
  });

  const hasProjectKey = Boolean(form.formState.apiKey);
  const isSyncing = Boolean(form.formState.method === 'sync');
  const isPushing = Boolean(form.formState.method === 'push');
  const isDownloading = Boolean(form.formState.method === 'download');
  const isPreviewing = Boolean(form.formState.method === 'preview');
  const isReleasing = Boolean(form.formState.method === 'release');

  const submitText = useMemo(() => {
    switch (form.formState.method) {
      case 'sync':
        return sync.active ? 'Disconnect' : 'Sync';
      default:
        return titleCase(form.formState.method);
    }
  }, [form.formState.method, sync.active]);

  const onSuccess = () => {
    setMsgFailure('');
    if (form.formState.method !== 'sync') {
      setHasSuccess(true);
      setExporting(false);
    }
    setTimeout(() => {
      if (form.formState.method !== 'sync') {
        setHasSuccess(false);
        setExportCount(0);
      }
    }, 5000);
  };
  const onError = (msg: string) => {
    setMsgFailure(msg);
    setHasSuccess(false);
    setExporting(false);
    setTimeout(() => {
      setHasSuccess(false);
      setMsgFailure('');
      setExporting(false);
      setExportCount(0);
    }, 10000);
  };

  useProjectRelease(onSuccess, onError, setExportCount);

  return (
    <Fragment>
      {hasSuccess &&
        <Banner icon={<IconCheck/>} variant="success">
          {`Successfully exported ${exportCount} component${exportCount === 1 ? '' : 's'}!`}
        </Banner>
      }
      {msgFailure &&
        <Banner icon={<IconWarning/>} variant="warning">
          {msgFailure}
        </Banner>
      }
      {isExporting &&
        <Banner icon={<IconCheck/>}>
          {isReleasing 
            ? 'Publishing, please wait...'
            : `Exporting ${form.formState.scope}, please wait...`
          }
        </Banner>
      }
      <Container space="medium" style={{
        maxWidth: 340,
        paddingTop: 12,
        margin: '0 auto',
      }}>
        <Fragment>
          <Text weight="strong">
            Method
          </Text>
          <VerticalSpace space="small"/>
          <SegmentedControl.Root
            disabled={isExporting}
            value={form.formState.method}
            onValueChange={(v: ProjectExportMethod) => form.setFormState(v, 'method')}>
            <SegmentedControl.Item value="download" aria-label="Download">
              <Text style={{paddingInline: 8}}>
                Download
              </Text>
            </SegmentedControl.Item>
            <SegmentedControl.Item value="push" aria-label="Git">
              <Text style={{paddingInline: 8}}>
                Git
              </Text>
            </SegmentedControl.Item>
            <SegmentedControl.Item value="sync" aria-label="Sync">
              <Text style={{paddingInline: 8}}>
                Sync
              </Text>
            </SegmentedControl.Item>
            {/* <SegmentedControl.Item value="release" aria-label="Release">
              <Text style={{paddingInline: 8}}>
                Release
              </Text>
            </SegmentedControl.Item> */}
          </SegmentedControl.Root>
          <VerticalSpace space="large"/>
        </Fragment>
        {isDownloading &&
          <Fragment>
            <Text weight="strong">
              Scope
            </Text>
            <VerticalSpace space="small"/>
            <SegmentedControl.Root
              disabled={isExporting}
              value={form.formState.scope}
              onValueChange={(v: ProjectExportScope) => form.setFormState(v, 'scope')}>
              <SegmentedControl.Item value="document" aria-label="Document">
                <Text style={{paddingInline: 8}}>
                  Document
                </Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="page" aria-label="Page">
                <Text style={{paddingInline: 8}}>
                  Page
                </Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="selected" aria-label="Selection">
                <Text style={{paddingInline: 8}}>
                  Selection
                </Text>
              </SegmentedControl.Item>
            </SegmentedControl.Root>
            <VerticalSpace space="large"/>
          </Fragment>
        }
        {(isSyncing || isPreviewing || isReleasing) &&
          <Fragment>
            <Flex align="center">
              <Text weight="strong">
                Project Key
              </Text>
              <a
                href={`${F2RN_SERVICE_URL}/dashboard`}
                target="_blank"
                rel="noreferrer"
                style={{marginLeft: '4px'}}>
                <IconHelp color="brand"/>
              </a>
            </Flex>
            <VerticalSpace space="small"/>
            <Input
              type="password"
              value={form.formState.apiKey}
              disabled={isExporting}
              placeholder="Your Figma -> React Native Project Key"
              onChange={(e) => {
                form.setFormState(e.target.value, 'apiKey');
              }}
              onFocus={(e) => {
                e.target.type = 'text';
                e.target.select();
              }}
              onBlur={(e) => {
                e.target.type = 'password';
              }}
            />
            <VerticalSpace space="large"/>
          </Fragment>
        }
        {isPushing &&
          <Fragment>
            <Flex align="center">
              <Text weight="strong">
                Repository
              </Text>
            </Flex>
            <VerticalSpace space="small"/>
            <Input
              type="text"
              disabled={isExporting}
              value={form.formState.gitRepo}
              placeholder={F2RN_EXO_REPO_URL}
              onChange={(e) => {
                form.setFormState(e.target.value, 'gitRepo');
              }}
            />
            <VerticalSpace space="large"/>
            <Flex align="center">
              <Text weight="strong">
                Branch
              </Text>
            </Flex>
            <VerticalSpace space="small"/>
            <Input
              type="text"
              disabled={isExporting}
              value={form.formState.gitBranch}
              placeholder="master"
              onChange={(e) => {
                form.setFormState(e.target.value, 'gitBranch');
              }}
            />
            <VerticalSpace space="large"/>
            <Flex align="center">
              <Text weight="strong">
                Token
              </Text>
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
              disabled={isExporting}
              value={form.formState.gitKey}
              placeholder="Your GitHub Personal Access Token"
              onChange={(e) => {
                form.setFormState(e.target.value, 'gitKey');
              }}
              onFocus={(e) => {
                e.target.type = 'text';
                e.target.select();
              }}
              onBlur={(e) => {
                e.target.type = 'password';
              }}
            />
            <VerticalSpace space="large"/>
          </Fragment>
        }
        <Fragment>
          <Text weight="strong">
            Options
          </Text>
          <VerticalSpace space="medium"/>
          <Fragment>
            <Checkbox.Root>
              <Checkbox.Input
                disabled={isExporting}
                checked={form.formState.includeAssets}
                onChange={(e) => form.setFormState(e.target.checked, 'includeAssets')}
              />
              <Checkbox.Label>
                <Text>Include assets</Text>
              </Checkbox.Label>
              <Checkbox.Description>
                Extract images and vectors.
              </Checkbox.Description>
            </Checkbox.Root>
            <VerticalSpace space="small"/>
          </Fragment>
          {isDownloading &&
            <Fragment>
              <Checkbox.Root>
                <Checkbox.Input
                  disabled={isExporting}
                  checked={form.formState.includeTemplate}
                  onChange={(e) => form.setFormState(e.target.checked, 'includeTemplate')}
                />
                <Checkbox.Label>
                  <Text>Include template</Text>
                </Checkbox.Label>
                <Checkbox.Description>
                  Use the latest EXO template.
                </Checkbox.Description>
              </Checkbox.Root>
              <VerticalSpace space="small"/>
            </Fragment>
          }
          {isReleasing &&
            <Fragment>
              <Checkbox.Root>
                <Checkbox.Input
                  disabled={isExporting}
                  checked={form.formState.enableAssetOptimizations}
                  onChange={(e) => form.setFormState(e.target.checked, 'enableAssetOptimizations')}
                />
                <Checkbox.Label>
                  <Text>Optimize assets</Text>
                </Checkbox.Label>
                <Checkbox.Description>
                  Reduce the file size of images and vectors.
                </Checkbox.Description>
              </Checkbox.Root>
              <VerticalSpace space="small"/>
            </Fragment>
          }
        </Fragment>
        <Fragment>
          <VerticalSpace space="large"/>
          <Flex align="center">
            <Flex align="center" gap="2" style={{width: '100%'}}>
              <Button
                size="medium"
                fullWidth
                style={{flex: 1}}
                variant={sync.active && isSyncing ? 'destructive' : 'primary'}
                loading={isExporting ? 'true' : undefined}
                disabled={isExporting || (!isDownloading && !hasProjectKey)}
                onClick={form.handleSubmit}>
                {submitText}
              </Button>
              {sync.active && isSyncing && form.formState.apiKey && (
                <>
                  <IconButton
                    onClick={() => emit<EventOpenLink>('OPEN_LINK', `${F2RN_SERVICE_URL}/sync/${docId}`)}
                    aria-label="Sync to desktop">
                    <IconHyperlink/>
                  </IconButton>
                </>
              )}
            </Flex>
          </Flex>
        </Fragment>
        <VerticalSpace space="large"/>
        <div style={{display: 'none'}} {...form.initialFocus}/>
      </Container>
    </Fragment>
  );
}
