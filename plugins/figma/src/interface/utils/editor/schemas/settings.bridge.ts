import {JSONSchemaBridge} from 'uniforms-bridge-json-schema';

import schema from './settings.json';
import validator from './settings.validator';

export const bridge = new JSONSchemaBridge({schema, validator});
