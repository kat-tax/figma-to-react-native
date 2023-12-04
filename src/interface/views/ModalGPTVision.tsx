import {h, Fragment} from 'preact';
import {useState} from 'preact/hooks';
import {GPT4_VISION_PROMPT} from 'config/env';

import * as F from '@create-figma-plugin/ui';

import type {ProjectConfig} from 'types/project';
import type {ComponentBuild} from 'types/component';

const tips = {
  prompt: `The prompt for this component`,
  submit: `Patch your component with GPT-4`,
};

interface ModalGPTVisionProps {
  target: string,
  project: ProjectConfig,
  build: ComponentBuild,
}

interface ModalGPTVisionForm {
  prompt: string,
}

export function ModalGPTVision(props: ModalGPTVisionProps) {
  const [isGenerating, setGenerating] = useState(false);

  const initialForm: ModalGPTVisionForm = {
    prompt: GPT4_VISION_PROMPT,
  };

  const form = F.useForm<ModalGPTVisionForm>(initialForm, {
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
        <F.Banner icon={<F.IconTimer32/>}>
          Generating code, please wait...
        </F.Banner>
      }
      <F.Container space="medium">
        <F.VerticalSpace space="large"/>
        <div title={tips.prompt}>
          <F.TextboxMultiline
            name="prompt"
            style={{width: '240px', height: '154px'}}
            placeholder="Enter a prompt"
            value={form.formState.prompt}
            onValueInput={form.setFormState}
            aria-label={tips.prompt}
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
