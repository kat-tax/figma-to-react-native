import {emit} from '@create-figma-plugin/utilities';
import {useState, Fragment} from 'react';
import {Flex, Text, Input, Button, SegmentedControl} from 'figma-kit';
import {useForm} from 'interface/figma/hooks/use-form';
import {Banner} from 'interface/figma/ui/banner';
import {Container} from 'interface/figma/ui/container';
import {VerticalSpace} from 'interface/figma/ui/vertical-space';
import {IconCheck} from 'interface/figma/icons/24/Check';
import {IconHelp} from 'interface/figma/icons/16/Help';
import {IconWarning} from 'interface/figma/icons/32/Warning';
import {titleCase} from 'common/string';
import {F2RN_EXO_REPO_URL, F2RN_SERVICE_URL} from 'config/consts';

import type {ProjectConfig, ProjectExport, ProjectExportMethod} from 'types/project';
import type {ProjectSettings} from 'types/settings';
import type {ComponentBuild} from 'types/component';
import type {EventProjectExport} from 'types/events';

interface ProjectExportProps {
  build: ComponentBuild,
  project: ProjectConfig,
  writer: ProjectSettings['writer'],
  addTranslate: ProjectSettings['addTranslate'],
}

export function ProjectExport({build, project, ...settings}: ProjectExportProps) {
  const [exportCount, setExportCount] = useState(0);
  const [isExporting, setExporting] = useState(false);
  const [hasSuccess, setHasSuccess] = useState(false);
  const [msgFailure, setMsgFailure] = useState('');
  const [config, setConfig] = useState(project);

  const form = useForm<ProjectExport>({
    method: 'zip',
  }, {
    close: () => {},
    validate: (_data) => true,
    submit: (form) => {
      setExporting(true);
      setHasSuccess(false);
      emit<EventProjectExport>('PROJECT_EXPORT', form, config, settings);
    },
  });

  const hasApiKey = Boolean(config.apiKey);
  const isGit = Boolean(form.formState.method === 'git');
  const isZip = Boolean(form.formState.method === 'zip');
  const isRun = Boolean(form.formState.method === 'run');
  const isNpm = Boolean(form.formState.method === 'npm');

  const onSuccess = () => {
    setMsgFailure('');
    setExporting(false);
    setHasSuccess(true);
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
          {`${isNpm ? 'Publishing' : 'Exporting'}, please wait...`}
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
            <SegmentedControl.Item value="zip" aria-label="Download">
              <Text style={{paddingInline: 8}}>
                Download
              </Text>
            </SegmentedControl.Item>
            <SegmentedControl.Item value="git" aria-label="Git">
              <Text style={{paddingInline: 8}}>
                Git
              </Text>
            </SegmentedControl.Item>
            {/* <SegmentedControl.Item value="npm" aria-label="Release">
              <Text style={{paddingInline: 8}}>
                Release
              </Text>
            </SegmentedControl.Item> */}
          </SegmentedControl.Root>
          <VerticalSpace space="large"/>
        </Fragment>
        {(isNpm || isRun) &&
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
              value={config.apiKey}
              disabled={isExporting}
              placeholder="Your Figma -> React Native Project Key"
              onChange={(e) => {
                setConfig({...config, apiKey: e.target.value});
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
        {isGit &&
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
              value={config.gitRepo}
              placeholder={F2RN_EXO_REPO_URL}
              onChange={(e) => {
                setConfig({...config, gitRepo: e.target.value});
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
              value={config.gitBranch}
              placeholder="master"
              onChange={(e) => {
                setConfig({...config, gitBranch: e.target.value});
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
              value={config.gitKey}
              placeholder="Your GitHub Personal Access Token"
              onChange={(e) => {
                setConfig({...config, gitKey: e.target.value});
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
          <VerticalSpace space="large"/>
          <Flex align="center">
            <Flex align="center" gap="2" style={{width: '100%'}}>
              <Button
                size="medium"
                fullWidth
                style={{flex: 1}}
                variant="primary"
                loading={isExporting ? 'true' : undefined}
                disabled={isExporting || (isNpm && !hasApiKey)}
                onClick={form.handleSubmit}>
                {titleCase(form.formState.method)}
              </Button>
            </Flex>
          </Flex>
        </Fragment>
        <VerticalSpace space="large"/>
        <div style={{display: 'none'}} {...form.initialFocus}/>
      </Container>
    </Fragment>
  );
}
