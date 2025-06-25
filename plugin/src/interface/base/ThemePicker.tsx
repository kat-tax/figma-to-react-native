import {Text, Button, ColorPicker} from 'figma-kit';
import {useState, Fragment} from 'react';
import {useForm} from 'interface/figma/hooks/use-form';
import {Container} from 'interface/figma/ui/container';
import {RadioButtons} from 'interface/figma/ui/radio-buttons';
import {VerticalSpace} from 'interface/figma/ui/vertical-space';
import {getCustomScale, getPresetScale, getPresetColor} from 'backend/importer/themes';
import {emit} from '@create-figma-plugin/utilities';

import type {EventProjectImportTheme} from 'types/events';
import type {ThemeForm, ThemePresets} from 'types/themes';

const init: ThemePresets = 'Zinc';
const tips = {
  submit: 'Generate the selected theme',
};

export function ThemePicker() {
  const [isGenerating, setGenerating] = useState(false);

  const initial: ThemeForm = {
    theme: init,
    color: getPresetColor(init),
    scale: getPresetScale(init),
    radius: '0.5',
  };

  const form = useForm<ThemeForm>(initial, {
    close: () => {},
    submit: ({theme, scale, radius}) => {
      emit<EventProjectImportTheme>('PROJECT_IMPORT_THEME', theme, scale, radius);
      setGenerating(true);
      setTimeout(() => {
        setGenerating(false);
      }, 200);
    },
  });

  return (
    <Container space="medium" style={{
      maxWidth: 340,
      paddingTop: 12,
      margin: '0 auto',
    }}>
      <Fragment>
        <Text weight="strong">
          Presets
        </Text>
        <VerticalSpace space="small"/>
        <div className="theme-picker-colors">
          <RadioButtons
            disabled={isGenerating}
            value={form.formState.theme}
            onValueChange={(theme: ThemePresets) => {
              const scale = getPresetScale(theme);
              const color = getPresetColor(theme);
              form.setFormState(theme, 'theme');
              form.setFormState(color, 'color');
              form.setFormState(scale, 'scale');
            }}
            options={[
              {value: 'Zinc', children: <Text>Zinc</Text>},
              {value: 'Slate', children: <Text>Slate</Text>},
              {value: 'Stone', children: <Text>Stone</Text>},
              {value: 'Grey', children: <Text>Grey</Text>},
              {value: 'Neutral', children: <Text>Neutral</Text>},
              {value: 'Red', children: <Text>Red</Text>},
              {value: 'Rose', children: <Text>Rose</Text>},
              {value: 'Orange', children: <Text>Orange</Text>},
              {value: 'Green', children: <Text>Green</Text>},
              {value: 'Blue', children: <Text>Blue</Text>},
              {value: 'Yellow', children: <Text>Yellow</Text>},
              {value: 'Violet', children: <Text>Violet</Text>},
            ]}
          />
        </div>
      </Fragment>
      <VerticalSpace space="extraLarge"/>
      <Fragment>
        <Text weight="strong">
          Custom
        </Text>
        <VerticalSpace space="small"/>
          <ColorPicker.Root
            color={form.formState.color}
            colorSpace="srgb"
            onColorChange={color => {
              const scale = getCustomScale(color);
              form.setFormState('Brand', 'theme');
              form.setFormState(color, 'color');
              form.setFormState(scale, 'scale');
            }}>
            <ColorPicker.Area size={160}/>
            <VerticalSpace space="small"/>
            <ColorPicker.Hue/>
            <VerticalSpace space="small"/>
            <ColorPicker.Input/>
          </ColorPicker.Root>
      </Fragment>
      <VerticalSpace space="extraLarge"/>
      <Fragment>
        <Text weight="strong">Scale</Text>
        <VerticalSpace space="small"/>
        <div className="theme-picker-palette">
          {Object.entries(form.formState.scale).map(([id, value]) => (
            <div key={id} id={id} style={{backgroundColor: value}}/>
          ))}
        </div>
      </Fragment>
      {/*<Fragment>
        <Text weight="strong">
          Radius
        </Text>
        <VerticalSpace space="small"/>
        <SegmentedControl
          value={form.formState.radius}
          onValueChange={(v: ThemeRadius) => form.setFormState(v, 'radius')}
          disabled={isGenerating}
          options={[
            {value: '0', children: '0'},
            {value: '0.3', children: '0.3'},
            {value: '0.5', children: '0.5'},
            {value: '0.75', children: '0.75'},
            {value: '1', children: '1.0'},
          ]}
        />
      </Fragment>*/}
      <VerticalSpace space="extraLarge"/>
      <VerticalSpace space="small"/>
      <Button
        fullWidth
        size="medium"
        variant="primary"
        title={tips.submit}
        disabled={isGenerating}
        onClick={form.handleSubmit}>
        Generate Theme
      </Button>
      <VerticalSpace space="large"/>
      <div style={{display: 'none'}} {...form.initialFocus}/>
    </Container>
  );
}
