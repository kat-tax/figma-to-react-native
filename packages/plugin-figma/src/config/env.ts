export const F2RN_UI_WIDTH_MIN = 249;

export const F2RN_EDITOR_NS = 'figma://preview/';
export const F2RN_CONFIG_NS = 'f2rn:config:v3';
export const F2RN_PROJECT_NS = 'f2rn:project:v3';
export const F2RN_NAVIGATE_NS = 'f2rn:navigate:v3';
export const F2RN_STYLEGEN_API = 'https://f2rn.deno.dev';

export const EXO_COMPONENTS: Record<string, [string, boolean]> = {
  Button: ['e4b4b352052ba71c847b20b49d9e88a0093d4449', true],
  Prompt: ['9261d5fed575a841eefc0de81b039814ef81b3ae', false],
  HoverCard: ['172abba0061738f4b1c69e85ef956603b4cdd5c4', false],
  Placeholder: ['5863ef713ca50d36c7f32f8d1f33335d7f9eb552', false],
};

export const EXO_PRIMITIVES: Record<string, [string, boolean]> = {
  Slider: ['35f02e59aa82623edd3e65a47ae53d0d8c93b190', false],
};

export const SUPABASE_PROJECT_URL = 'http://localhost:54321'; // 'https://ndfwacmspvrwdiqqeecz.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'; // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kZndhY21zcHZyd2RpcXFlZWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUyODA0MDYsImV4cCI6MjAxMDg1NjQwNn0.1ZfkWFCp20pYVU0d9ggmaIe36lFbZFYmOP_bXgtrHxI';

export const LOGTAIL_TOKEN = '3hRzjtVJTBk6BDFt3pSjjKam';

export const UNISTYLES_LIB = `import {createUnistyles} from 'react-native-unistyles';
import theme, {breakpoints} from 'theme';

export const {createStyleSheet, useStyles} = createUnistyles<
  typeof breakpoints,
  typeof theme
>(breakpoints);
`;
