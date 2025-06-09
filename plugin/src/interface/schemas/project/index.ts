import {JSONSchemaBridge} from 'uniforms-bridge-json-schema';
import schema from './schema.json';
import validator from './validator';

export default new JSONSchemaBridge({schema, validator});
