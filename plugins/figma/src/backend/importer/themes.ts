import * as color from 'common/color';
import * as consts from 'config/consts';
import * as parser from 'backend/parser/lib';

import type {ThemeScale, ThemeRadius, ThemeTokens, ThemePresets} from 'types/themes';

export async function importTheme(
  theme: ThemePresets | 'Brand',
  scale: ThemeScale,
  radius: ThemeRadius,
) {
  const tokens = getTokens(theme, scale);
  await createTheme(tokens);
  figma.notify(`${theme === 'Brand' ? 'Custom' : theme} theme created`, {
    timeout: 3000,
  });
}

async function createTheme(preset: ThemeTokens) {
  try {
    return await createVariableTheme(preset);
  } catch (e) {
    console.log('Could not create theme', e);
    return await createLocalStylesTheme(preset);
  }
}

async function createLocalStylesTheme(preset: ThemeTokens): Promise<{
  styles: Record<string, PaintStyle>,
  isVariable: false,
}> {
  const styles: Record<string, PaintStyle> = {};
  const existingStyles = await figma.getLocalPaintStylesAsync();
  Object.entries(preset.modes.light)?.forEach(([name, token]) => {
    let style = existingStyles.find(s => s.name === name);
    const color = preset.colors[token];
    if (!style && color) {    
      style = figma.createPaintStyle();
      style.name = name;
      style.paints = [{color, type: 'SOLID'}];
    }
  });
  return {styles, isVariable: false};
}

async function createVariableTheme(preset: ThemeTokens): Promise<{
  themeVars: Record<string, Variable>,
  paletteVars: Record<string, Variable>,
  isVariable: true,
}> {
  const themeVars: Record<string, Variable> = {};
  const paletteVars: Record<string, Variable> = {};
  const createdThemeVars: Record<string, boolean> = {};

  // Try to find existing collections
  let theme = await parser.getVariableCollection(consts.VARIABLE_COLLECTIONS.THEMES);
  let palette = await parser.getVariableCollection(consts.VARIABLE_COLLECTIONS.SCALE_COLORS);

  // Try to create palette collection if does not exist
  // Note: this will be a Figma pay-walled feature after public beta
  if (!palette) {
    try {
      palette = figma.variables.createVariableCollection(consts.VARIABLE_COLLECTIONS.SCALE_COLORS);
      palette.renameMode(palette.defaultModeId, 'Default');
    } catch (e) {
      throw new Error(e);
    }
  }

  // Try to create theme collection if does not exist
  // Note: this will be a Figma pay-walled feature after public beta
  if (!theme) {
    try {
      theme = figma.variables.createVariableCollection(consts.VARIABLE_COLLECTIONS.THEMES);
    } catch (e) {
      throw new Error(e);
    }
  }

  // Try to add dark mode to theme collection
  // Note: this is currently a Figma pay-walled feature
  try {
    if (theme.modes.length === 1) {
      theme.addMode('Dark');
      theme.renameMode(theme.defaultModeId, 'Light');
    }
  } catch (e) {
    theme.renameMode(theme.defaultModeId, 'Main');
    console.log('Could not add dark mode', e);
  }

  // Look for preset palette variables
  {
    const variables = await parser.getVariables(palette.variableIds);
    const presetVars = Object.keys(preset.colors);
    for (const vars of variables) {
      if (presetVars.includes(vars.name))
        paletteVars[vars.name] = vars;
    }
  }

  // Look for preset theme variables
  {
    const variables = await parser.getVariables(theme.variableIds);
    const presetVars = Object.keys(colorMapping.light);
    for (const vars of variables) {
      if (presetVars.includes(vars.name))
        themeVars[vars.name] = vars;
    }
  }

  // Create non-existing theme variables
  for (const name of Object.keys(preset.modes.light)) {
    if (!themeVars[name]) {
      try {
        themeVars[name] = figma.variables.createVariable(name, theme, 'COLOR');
        createdThemeVars[name] = true;
      } catch (e) {
        throw new Error(e);
      }
    }
  }

  // Create non-existing palette variables
  for (const [name, rgb] of Object.entries(preset.colors)) {
    if (!paletteVars[name]) {
      try {
        const colorVar = figma.variables.createVariable(name, palette, 'COLOR');
        colorVar.setValueForMode(palette.defaultModeId, rgb);
        paletteVars[name] = colorVar;
      } catch (e) {
        throw new Error(e);
      }
    }
  }

  // If created any theme variables, set colors for all modes
  if (Object.keys(createdThemeVars).length > 0) {
    theme.modes.forEach(({modeId}) => {
      const isDefault = modeId === theme.defaultModeId;
      const modeType = isDefault ? 'light' : 'dark';
      Object.entries(preset.modes[modeType])?.forEach(([name, token]) => {
        const variable = themeVars[name];
        variable.setValueForMode(modeId, {
          id: paletteVars[token].id,
          type: 'VARIABLE_ALIAS',
        });
      });
    });
  }

  // Return variables
  return {
    themeVars,
    paletteVars,
    isVariable: true,
  };
}

export function getTokens(
  color: ThemePresets | 'Brand',
  scale: ThemeScale,
): ThemeTokens {
  const tokens = {colors: {}, modes: {light: {}, dark: {}}} as ThemeTokens;

  // Color scales
  const scales = color !== 'Brand'
    ? colorPresets
    : {
      Brand: Object.entries(scale).map(([k,v]) =>
        ({scale: Number(k), hex: v})),
      ...colorPresets,
    };

  // Color tokens
  tokens.colors.White = {r: 1, g: 1, b: 1};
  tokens.colors.Black = {r: 0, g: 0, b: 0};
  Object.entries(scales).forEach(([colorName, colorScale]) => {
    for (const {scale, hex} of colorScale) {
      if (hex) {
        tokens.colors[`${colorName}/${scale}`] = figma.util.rgb(hex);
      }
    }
  });

  // Theme tokens
  for (const [name, token] of Object.entries(colorMapping.light))
    tokens.modes.light[name] = token.replace('{{base}}', color);
  for (const [name, token] of Object.entries(colorMapping.dark))
    tokens.modes.dark[name] = token.replace('{{base}}', color);

  // Return tokens
  return tokens;
}

export function getCustomScale(baseColor: RGB): ThemeScale {
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const [h, s, l] = color.hexToHsl(parser.getColor(baseColor));
  const scale = {} as ThemeScale;
  const base = 600;
  steps.forEach((step) => {
    const lightness = l + (base - step) / 10;
    scale[step] = color.hslToHex(h, s, Math.min(100, Math.max(0, lightness)));
  });
  return scale;
}

export function getCustomScale2(baseColor: RGB): ThemeScale {
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const delta = [63, 61, 57, 51, 30, 12, 0, -8, -17, -24, -30];
  const [h, s, l] = color.hexToHsl(parser.getColor(baseColor));
  const scale = {} as ThemeScale;
  steps.forEach((step, index) => {
    const lightness = l + delta[index];
    scale[step] = color.hslToHex(h, s, Math.min(100, Math.max(0, lightness)));
  });
  return scale;
}

export function getPresetScale(scale: keyof typeof colorPresets): ThemeScale {
  return colorPresets[scale].reduce((acc, {scale, hex}) => {
    acc[scale] = hex;
    return acc;
  }, {} as ThemeScale);
}

export function getPresetColor(color: keyof typeof colorPresets): RGBA {
  return parser.getRGB(colorPresets[color][6].hex);
}

const colorMapping = {
  light: {
    'Background': 'White',
    'Foreground': '{{base}}/950',
    'Card': 'White',
    'Card Foreground': '{{base}}/950',
    'Popover': 'White',
    'Popover Foreground': '{{base}}/950',
    'Primary': '{{base}}/900',
    'Primary Foreground': '{{base}}/50',
    'Secondary': '{{base}}/100',
    'Secondary Foreground': '{{base}}/900',
    'Muted': '{{base}}/100',
    'Muted Foreground': '{{base}}/500',
    'Accent': '{{base}}/100',
    'Accent Foreground': '{{base}}/900',
    'Destructive': 'Red/500',
    'Destructive Foreground': '{{base}}/50',
    'Border': '{{base}}/200',
    'Input': '{{base}}/200',
    'Ring': '{{base}}/950',
  },
  dark: {
    'Background': '{{base}}/950',
    'Foreground': '{{base}}/50',
    'Card': '{{base}}/950',
    'Card Foreground': '{{base}}/50',
    'Popover': '{{base}}/950',
    'Popover Foreground': '{{base}}/50',
    'Primary': '{{base}}/50',
    'Primary Foreground': '{{base}}/900',
    'Secondary': '{{base}}/800',
    'Secondary Foreground': '{{base}}/50',
    'Muted': '{{base}}/800',
    'Muted Foreground': '{{base}}/400',
    'Accent': '{{base}}/800',
    'Accent Foreground': '{{base}}/50',
    'Destructive': 'Red/900',
    'Destructive Foreground': '{{base}}/50',
    'Border': '{{base}}/800',
    'Input': '{{base}}/800',
    'Ring': '{{base}}/300',
  },
} as const

const colorPresets = {
  Slate: [
    {scale: 50, hex: '#f8fafc'},
    {scale: 100, hex: '#f1f5f9'},
    {scale: 200, hex: '#e2e8f0'},
    {scale: 300, hex: '#cbd5e1'},
    {scale: 400, hex: '#94a3b8'},
    {scale: 500, hex: '#64748b'},
    {scale: 600, hex: '#475569'},
    {scale: 700, hex: '#334155'},
    {scale: 800, hex: '#1e293b'},
    {scale: 900, hex: '#0f172a'},
    {scale: 950, hex: '#020617'},
  ],
  Grey: [
    {scale: 50, hex: '#f9fafb'},
    {scale: 100, hex: '#f3f4f6'},
    {scale: 200, hex: '#e5e7eb'},
    {scale: 300, hex: '#d1d5db'},
    {scale: 400, hex: '#9ca3af'},
    {scale: 500, hex: '#6b7280'},
    {scale: 600, hex: '#4b5563'},
    {scale: 700, hex: '#374151'},
    {scale: 800, hex: '#1f2937'},
    {scale: 900, hex: '#111827'},
    {scale: 950, hex: '#030712'},
  ],
  Zinc: [
    {scale: 50, hex: '#fafafa'},
    {scale: 100, hex: '#f4f4f5'},
    {scale: 200, hex: '#e4e4e7'},
    {scale: 300, hex: '#d4d4d8'},
    {scale: 400, hex: '#a1a1aa'},
    {scale: 500, hex: '#71717a'},
    {scale: 600, hex: '#52525b'},
    {scale: 700, hex: '#3f3f46'},
    {scale: 800, hex: '#27272a'},
    {scale: 900, hex: '#18181b'},
    {scale: 950, hex: '#09090b'},
  ],
  Neutral: [
    {scale: 50, hex: '#fafafa'},
    {scale: 100, hex: '#f5f5f5'},
    {scale: 200, hex: '#e5e5e5'},
    {scale: 300, hex: '#d4d4d4'},
    {scale: 400, hex: '#a3a3a3'},
    {scale: 500, hex: '#737373'},
    {scale: 600, hex: '#525252'},
    {scale: 700, hex: '#404040'},
    {scale: 800, hex: '#262626'},
    {scale: 900, hex: '#171717'},
    {scale: 950, hex: '#0a0a0a'},
  ],
  Stone: [
    {scale: 50, hex: '#fafaf9'},
    {scale: 100, hex: '#f5f5f4'},
    {scale: 200, hex: '#e7e5e4'},
    {scale: 300, hex: '#d6d3d1'},
    {scale: 400, hex: '#a8a29e'},
    {scale: 500, hex: '#78716c'},
    {scale: 600, hex: '#57534e'},
    {scale: 700, hex: '#44403c'},
    {scale: 800, hex: '#292524'},
    {scale: 900, hex: '#1c1917'},
    {scale: 950, hex: '#0c0a09'},
  ],
  Red: [
    {scale: 50, hex: '#fef2f2'},
    {scale: 100, hex: '#fee2e2'},
    {scale: 200, hex: '#fecaca'},
    {scale: 300, hex: '#fca5a5'},
    {scale: 400, hex: '#f87171'},
    {scale: 500, hex: '#ef4444'},
    {scale: 600, hex: '#dc2626'},
    {scale: 700, hex: '#b91c1c'},
    {scale: 800, hex: '#991b1b'},
    {scale: 900, hex: '#7f1d1d'},
    {scale: 950, hex: '#450a0a'},
  ],
  Orange: [
    {scale: 50, hex: '#fff7ed'},
    {scale: 100, hex: '#ffedd5'},
    {scale: 200, hex: '#fed7aa'},
    {scale: 300, hex: '#fdba74'},
    {scale: 400, hex: '#fb923c'},
    {scale: 500, hex: '#f97316'},
    {scale: 600, hex: '#ea580c'},
    {scale: 700, hex: '#c2410c'},
    {scale: 800, hex: '#9a3412'},
    {scale: 900, hex: '#7c2d12'},
    {scale: 950, hex: '#431407'},
  ],
  Amber: [
    {scale: 50, hex: '#fffbeb'},
    {scale: 100, hex: '#fef3c7'},
    {scale: 200, hex: '#fde68a'},
    {scale: 300, hex: '#fcd34d'},
    {scale: 400, hex: '#fbbf24'},
    {scale: 500, hex: '#f59e0b'},
    {scale: 600, hex: '#d97706'},
    {scale: 700, hex: '#b45309'},
    {scale: 800, hex: '#92400e'},
    {scale: 900, hex: '#78350f'},
    {scale: 950, hex: '#451a03'},
  ],
  Yellow: [
    {scale: 50, hex: '#fefce8'},
    {scale: 100, hex: '#fef9c3'},
    {scale: 200, hex: '#fef08a'},
    {scale: 300, hex: '#fde047'},
    {scale: 400, hex: '#facc15'},
    {scale: 500, hex: '#eab308'},
    {scale: 600, hex: '#ca8a04'},
    {scale: 700, hex: '#a16207'},
    {scale: 800, hex: '#854d0e'},
    {scale: 900, hex: '#713f12'},
    {scale: 950, hex: '#422006'},
  ],
  Lime: [
    {scale: 50, hex: '#f7fee7'},
    {scale: 100, hex: '#ecfccb'},
    {scale: 200, hex: '#d9f99d'},
    {scale: 300, hex: '#bef264'},
    {scale: 400, hex: '#a3e635'},
    {scale: 500, hex: '#84cc16'},
    {scale: 600, hex: '#65a30d'},
    {scale: 700, hex: '#4d7c0f'},
    {scale: 800, hex: '#3f6212'},
    {scale: 900, hex: '#365314'},
    {scale: 950, hex: '#1a2e05'},
  ],
  Green: [
    {scale: 50, hex: '#f0fdf4'},
    {scale: 100, hex: '#dcfce7'},
    {scale: 200, hex: '#bbf7d0'},
    {scale: 300, hex: '#86efac'},
    {scale: 400, hex: '#4ade80'},
    {scale: 500, hex: '#22c55e'},
    {scale: 600, hex: '#16a34a'},
    {scale: 700, hex: '#15803d'},
    {scale: 800, hex: '#166534'},
    {scale: 900, hex: '#14532d'},
    {scale: 950, hex: '#052e16'},
  ],
  Emerald: [
    {scale: 50, hex: '#ecfdf5'},
    {scale: 100, hex: '#d1fae5'},
    {scale: 200, hex: '#a7f3d0'},
    {scale: 300, hex: '#6ee7b7'},
    {scale: 400, hex: '#34d399'},
    {scale: 500, hex: '#10b981'},
    {scale: 600, hex: '#059669'},
    {scale: 700, hex: '#047857'},
    {scale: 800, hex: '#065f46'},
    {scale: 900, hex: '#064e3b'},
    {scale: 950, hex: '#022c22'},
  ],
  Teal: [
    {scale: 50, hex: '#f0fdfa'},
    {scale: 100, hex: '#ccfbf1'},
    {scale: 200, hex: '#99f6e4'},
    {scale: 300, hex: '#5eead4'},
    {scale: 400, hex: '#2dd4bf'},
    {scale: 500, hex: '#14b8a6'},
    {scale: 600, hex: '#0d9488'},
    {scale: 700, hex: '#0f766e'},
    {scale: 800, hex: '#115e59'},
    {scale: 900, hex: '#134e4a'},
    {scale: 950, hex: '#042f2e'},
  ],
  Cyan: [
    {scale: 50, hex: '#ecfeff'},
    {scale: 100, hex: '#cffafe'},
    {scale: 200, hex: '#a5f3fc'},
    {scale: 300, hex: '#67e8f9'},
    {scale: 400, hex: '#22d3ee'},
    {scale: 500, hex: '#06b6d4'},
    {scale: 600, hex: '#0891b2'},
    {scale: 700, hex: '#0e7490'},
    {scale: 800, hex: '#155e75'},
    {scale: 900, hex: '#164e63'},
    {scale: 950, hex: '#083344'},
  ],
  Sky: [
    {scale: 50, hex: '#f0f9ff'},
    {scale: 100, hex: '#e0f2fe'},
    {scale: 200, hex: '#bae6fd'},
    {scale: 300, hex: '#7dd3fc'},
    {scale: 400, hex: '#38bdf8'},
    {scale: 500, hex: '#0ea5e9'},
    {scale: 600, hex: '#0284c7'},
    {scale: 700, hex: '#0369a1'},
    {scale: 800, hex: '#075985'},
    {scale: 900, hex: '#0c4a6e'},
    {scale: 950, hex: '#082f49'},
  ],
  Blue: [
    {scale: 50, hex: '#eff6ff'},
    {scale: 100, hex: '#dbeafe'},
    {scale: 200, hex: '#bfdbfe'},
    {scale: 300, hex: '#93c5fd'},
    {scale: 400, hex: '#60a5fa'},
    {scale: 500, hex: '#3b82f6'},
    {scale: 600, hex: '#2563eb'},
    {scale: 700, hex: '#1d4ed8'},
    {scale: 800, hex: '#1e40af'},
    {scale: 900, hex: '#1e3a8a'},
    {scale: 950, hex: '#172554'},
  ],
  Indigo: [
    {scale: 50, hex: '#eef2ff'},
    {scale: 100, hex: '#e0e7ff'},
    {scale: 200, hex: '#c7d2fe'},
    {scale: 300, hex: '#a5b4fc'},
    {scale: 400, hex: '#818cf8'},
    {scale: 500, hex: '#6366f1'},
    {scale: 600, hex: '#4f46e5'},
    {scale: 700, hex: '#4338ca'},
    {scale: 800, hex: '#3730a3'},
    {scale: 900, hex: '#312e81'},
    {scale: 950, hex: '#1e1b4b'},
  ],
  Violet: [
    {scale: 50, hex: '#f5f3ff'},
    {scale: 100, hex: '#ede9fe'},
    {scale: 200, hex: '#ddd6fe'},
    {scale: 300, hex: '#c4b5fd'},
    {scale: 400, hex: '#a78bfa'},
    {scale: 500, hex: '#8b5cf6'},
    {scale: 600, hex: '#7c3aed'},
    {scale: 700, hex: '#6d28d9'},
    {scale: 800, hex: '#5b21b6'},
    {scale: 900, hex: '#4c1d95'},
    {scale: 950, hex: '#1e1b4b'},
  ],
  Purple: [
    {scale: 50, hex: '#faf5ff'},
    {scale: 100, hex: '#f3e8ff'},
    {scale: 200, hex: '#e9d5ff'},
    {scale: 300, hex: '#d8b4fe'},
    {scale: 400, hex: '#c084fc'},
    {scale: 500, hex: '#a855f7'},
    {scale: 600, hex: '#9333ea'},
    {scale: 700, hex: '#7e22ce'},
    {scale: 800, hex: '#6b21a8'},
    {scale: 900, hex: '#581c87'},
    {scale: 950, hex: '#3b0764'},
  ],
  Fuchsia: [
    {scale: 50, hex: '#fdf4ff'},
    {scale: 100, hex: '#fae8ff'},
    {scale: 200, hex: '#f5d0fe'},
    {scale: 300, hex: '#f0abfc'},
    {scale: 400, hex: '#e879f9'},
    {scale: 500, hex: '#d946ef'},
    {scale: 600, hex: '#c026d3'},
    {scale: 700, hex: '#a21caf'},
    {scale: 800, hex: '#86198f'},
    {scale: 900, hex: '#701a75'},
    {scale: 950, hex: '#4a044e'},
  ],
  Pink: [
    {scale: 50, hex: '#fdf2f8'},
    {scale: 100, hex: '#fce7f3'},
    {scale: 200, hex: '#fbcfe8'},
    {scale: 300, hex: '#f9a8d4'},
    {scale: 400, hex: '#f472b6'},
    {scale: 500, hex: '#ec4899'},
    {scale: 600, hex: '#db2777'},
    {scale: 700, hex: '#be185d'},
    {scale: 800, hex: '#9d174d'},
    {scale: 900, hex: '#831843'},
    {scale: 950, hex: '#500724'},
  ],
  Rose: [
    {scale: 50, hex: '#fff1f2'},
    {scale: 100, hex: '#ffe4e6'},
    {scale: 200, hex: '#fecdd3'},
    {scale: 300, hex: '#fda4af'},
    {scale: 400, hex: '#fb7185'},
    {scale: 500, hex: '#f43f5e'},
    {scale: 600, hex: '#e11d48'},
    {scale: 700, hex: '#be123c'},
    {scale: 800, hex: '#9f1239'},
    {scale: 900, hex: '#881337'},
    {scale: 950, hex: '#4c0519'},
  ],
} as const
