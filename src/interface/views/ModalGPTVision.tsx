import {h, Fragment} from 'preact';
import {useState} from 'preact/hooks';
import {GPT4_VISION_PROMPT} from 'config/env';

import * as F from '@create-figma-plugin/ui';

import type {ProjectConfig} from 'types/project';
import type {ComponentBuild} from 'types/component';

const tips = {
  packageName: `The prompt for this component`,
  submit: `Patch your component with GPT-4`,
};

interface ModalGPTVisionProps {
  project: ProjectConfig;
  build: ComponentBuild;
}

export function ModalGPTVision(props: ModalGPTVisionProps) {
  const [isGenerating, setGenerating] = useState(false);

  const form = F.useForm<ProjectConfig>(props.project, {
    close: () => {},
    submit: (data) => {
      setGenerating(true);
      // TODO: load saved prompt from component data
      // TODO: send component image export and prompt to ui
      // TODO: submit to GPT-4 Vision
      // TODO: update component code via the store
    },
  });

  return (
    <Fragment>
      {isGenerating &&
        <F.Banner icon={<F.IconCheckCircle32/>}>
          Generating code, please wait...
        </F.Banner>
      }
      <F.Container space="medium">
        <F.VerticalSpace space="large"/>
        <div title={tips.packageName}>
          <F.TextboxMultiline
            name="packageName"
            style={{width: '240px', height: '160px'}}
            placeholder="Enter a prompt"
            value={form.formState.packageName || GPT4_VISION_PROMPT}
            onValueInput={form.setFormState}
            aria-label={tips.packageName}
            variant="border"
          />
          <F.VerticalSpace space="large"/>
        </div>
        <Fragment>
          <F.Button
            fullWidth
            title={tips.submit}
            loading={isGenerating}
            disabled={isGenerating}
            onClick={form.handleSubmit}>
            {`Patch Component`}
          </F.Button>
        </Fragment>
        <F.VerticalSpace space="medium"/>
        <div style={{display: 'none'}} {...form.initialFocus}/>
      </F.Container>
    </Fragment>
  );
}
