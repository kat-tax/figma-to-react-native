import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {writeFile} from './write-file';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_SUFFIX = 'default';

const TYPE_NAMES: Record<string, string> = {
  text: 'TextColor',
  icon: 'IconColor',
  border: 'BorderColor',
  bg: 'BackgroundColor',
}

async function main() {
  try {
    const themePath = join(resolve(__dirname, '..', 'src'), 'css', 'theme.css');
    const outputPath = resolve(__dirname, '..', 'src', 'types', 'colors.ts');
    await generateColorsTypes(themePath, outputPath);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}

main();

async function generateColorsTypes(themePath: string, outputPath: string): Promise<void> {
  const colors = await parseIconColors(themePath);
  const contents: Array<string> = [];
  for (const tokenPrefix in colors) {
    if (typeof TYPE_NAMES[tokenPrefix] === 'undefined')
      throw new Error('Unrecognized `tokenPrefix`');
    const result: Array<string> = [`export type ${TYPE_NAMES[tokenPrefix]} =`];
    for (const color of colors[tokenPrefix])
      result.push(`  | '${color}'`);
    contents.push(`${result.join('\n')}`);
  }
  await writeFile(outputPath, `${contents.join('\n\n')}\n`);
}

async function parseIconColors(themePath: string): Promise<Record<string, Array<string>>> {
  const content = await readFile(themePath, 'utf8');
  const matches = content.match(/\{([^}]+)\}/m);
  if (matches === null)
    throw new Error('`match` is `null`');
  const regexVar = /--figma-color-([^-]+)(?:-([^:]+))?:/;
  const lines = matches[1].trim().split(/\n/g);
  const result: Record<string, Array<string>> = {};
  for (const line of lines) {
    const matches = line.trim().match(regexVar);
    if (matches === null)
      continue;
    const prefix = matches[1];
    const suffix = typeof matches[2] === 'undefined' ? DEFAULT_SUFFIX : matches[2];
    if (typeof result[prefix] === 'undefined')
      result[prefix] = [];
    result[prefix].push(suffix);
  }
  for (const type in result)
    result[type].sort();
  return result;
}
