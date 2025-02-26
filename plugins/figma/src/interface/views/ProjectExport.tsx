import {emit} from '@create-figma-plugin/utilities';
import {useState, Fragment} from 'react';
import {Flex, Text, Input, Button, Checkbox, SegmentedControl} from 'figma-kit';
import {useForm, Container, VerticalSpace, Banner, IconComponent32, IconCheckCircle32, IconCircleHelp16, IconWarning32} from 'figma-ui';
import {useProjectRelease} from 'interface/hooks/useProjectRelease';
import {F2RN_EXO_REPO_URL} from 'config/consts';
import {titleCase} from 'common/string';

import type {ProjectRelease, ProjectExportMethod, ProjectExportScope} from 'types/project';
import type {EventProjectExport} from 'types/events';
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

  const form = useForm<ProjectRelease>(props.project, {
    close: () => {},
    validate: (_data) => true,
    submit: (data) => {
      setHasSuccess(false);
      setExporting(true);
      emit<EventProjectExport>('PROJECT_EXPORT', data);
    },
  });

  const hasProjectKey = Boolean(form.formState.apiKey);
  const isSyncing = Boolean(form.formState.method === 'sync');
  const isPushing = Boolean(form.formState.method === 'push');
  const isDownloading = Boolean(form.formState.method === 'download');
  const isPreviewing = Boolean(form.formState.method === 'preview');
  const isReleasing = Boolean(form.formState.method === 'release');

  const onSuccess = () => {
    setMsgFailure('');
    setHasSuccess(true);
    setExporting(false);
    setTimeout(() => {
      setHasSuccess(false);
      setExportCount(0);
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
        <Banner icon={<IconComponent32/>} variant="success">
          {`Successfully exported ${exportCount} component${exportCount === 1 ? '' : 's'}!`}
        </Banner>
      }
      {msgFailure &&
        <Banner icon={<IconWarning32/>} variant="warning">
          {msgFailure}
        </Banner>
      }
      {isExporting &&
        <Banner icon={<IconCheckCircle32/>}>
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
                Zip
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
            <SegmentedControl.Item value="release" aria-label="Release">
              <Text style={{paddingInline: 8}}>
                Release
              </Text>
            </SegmentedControl.Item>
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
                href="http://figma-to-react-native.com/dashboard"
                target="_blank"
                rel="noreferrer"
                style={{marginLeft: '4px'}}>
                <IconCircleHelp16 color="brand"/>
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
                <IconCircleHelp16 color="brand"/>
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
          <Button
            fullWidth
            size="medium"
            variant="primary"
            loading={isExporting ? 'true' : undefined}
            disabled={isExporting || (!isDownloading && !hasProjectKey)}
            onClick={form.handleSubmit}>
            {titleCase(form.formState.method)}
          </Button>
        </Fragment>
        <VerticalSpace space="large"/>
        <div style={{display: 'none'}} {...form.initialFocus}/>
      </Container>
    </Fragment>
  );
}
