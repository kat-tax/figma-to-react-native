export const F2RN_UI_WIDTH_MIN = 300;

export const F2RN_STYLEGEN_API = 'https://f2rn.deno.dev';
export const F2RN_EXO_PROXY_URL = 'https://gh-cors-proxy.ult.workers.dev/?url=';
export const F2RN_EXO_REPO_ZIP = 'https://codeload.github.com/kat-tax/exo/zip/refs/heads/master';
export const F2RN_EDITOR_NS = 'figma://preview/';

export const F2RN_SETTINGS_USER = 'f2rn:user:1001';
export const F2RN_SETTINGS_PROJECT = 'f2rn:project:1001';
export const F2RN_PROJECT_RELEASE = 'f2rn:release:1001';

export const F2RN_SERVICE_URL = 'http://localhost:3000'; // https://figma-to-react-native.com
export const F2RN_PREVIEW_URL = 'http://localhost:5102'; // https://fig.run
export const SUPABASE_PROJECT_URL = 'http://localhost:54321'; // 'https://ndfwacmspvrwdiqqeecz.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'; // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZIsInJlZiI6Im5kZndhY21zcHZyd2RpcXFlZWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUyODA0MDYsImV4cCI6MjAxMDg1NjQwNn0.1ZfkWFCp20pYVU0d9ggmaIe36lFbZFYmOP_bXgtrHxI';

export const LOGTAIL_TOKEN = '3hRzjtVJTBk6BDFt3pSjjKam';

export const TIPTAP_APP_ID = '0X9LNVMR';

export const PAGES_SPECIAL = {
  NAVIGATION: 'Navigation',
  LIBRARY: 'Library',
  ICONS: 'Icons',
  TESTS: 'Tests',
} as const;

export const VARIABLE_COLLECTIONS = {
  // Main
  APP_CONFIG: 'App Config',
  BREAKPOINTS: 'Breakpoints',
  LOCALES: 'Locales',
  THEMES: 'Themes',
  FONTS: 'Fonts',
  // Scales
  SCALE_DISPLAY: '[Scale: Display]',
  SCALE_COLORS: '[Scale: Colors]',
  SCALE_FONTS: '[Scale: Fonts]',
  // State
  STATE_LOCAL: '[State: Local]',
  STATE_REDUX: '[State: Redux]',
} as const;
