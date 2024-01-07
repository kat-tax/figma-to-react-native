import {JSONSchemaBridge} from 'uniforms-bridge-json-schema';

// @ts-ignore
import schema from './schema.json';
// @ts-ignore
import validator from './validator';

export default new JSONSchemaBridge({schema, validator});
