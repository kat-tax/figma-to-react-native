import {emit} from '@create-figma-plugin/utilities';
import {getSelectedComponent} from 'plugin/fig/traverse';
import {generateBundle, generateTheme} from 'plugin/gen';
import * as config from 'plugin/config';

import type {AppPages} from 'types/app';
import type {EventPreviewComponent, EventPreviewTheme} from 'types/events';

let _code = '';
let _props = '';
let _preview = '';
let _selection: ComponentNode | null = null;
let _appPage: AppPages = 'code';

export function updateMode(value: AppPages) {
  _appPage = value;
  updateCode();
}

export function updateCode() {
  const selected = getSelectedComponent();
  const isPreview = _appPage === 'preview';
  if (selected) _selection = selected;
  generateBundle(selected || _selection, config.state, isPreview).then((bundle) => {
    if (bundle.code !== _code
      || bundle.props !== _props
      || bundle.preview !== _preview) {
      _code = bundle.code;
      _props = bundle.props;
      _preview = bundle.preview;
      emit<EventPreviewComponent>('PREVIEW_COMPONENT', JSON.stringify(bundle));
    }
  });
}

export function updateTheme() {
  if (_appPage !== 'theme') return;
  const theme = generateTheme(config.state);
  emit<EventPreviewTheme>('PREVIEW_THEME', theme);
}
