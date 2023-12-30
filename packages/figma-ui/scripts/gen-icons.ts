import slugify from '@sindresorhus/slugify';
import camelcase from 'camelcase';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {basename, dirname, extname, join, resolve} from 'node:path';
import {optimize} from 'svgo';
import {globby} from 'globby';
import {writeFileAsync} from './write-file-async';

type SvgFile = {
  dimension: number,
  componentName: string,
  baseName: string,
  svgPath: string,
}

const __dirname = dirname(fileURLToPath(import.meta.url));

(async function main(): Promise<void> {
  try {
    const glob = ['icons/**/*.svg'];
    const outputPath = resolve(__dirname, '..', 'src', 'icons');
    await generateIconsAsync(glob, outputPath);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
})();

async function generateIconsAsync(glob: Array<string>, outputPath: string): Promise<void> {
  const filePaths = await globby(glob);
  if (filePaths.length === 0)
    throw new Error(`No files match \`${glob.join(', ')}\``);
  const dirPaths = await globby(join(outputPath, 'icon-*'), {onlyFiles: false});
  const svgFiles = await readSvgFiles(filePaths);
  const dimensions = groupSvgFilesByDimension(svgFiles);
  for (const directoryPath of dirPaths)
    await fs.rm(directoryPath, {force: true, recursive: true});
  for (const dimension in dimensions) {
    const directoryPath = join(outputPath, `icon-${dimension}`);
    await writeComponents(dimensions[dimension], directoryPath);
  }
}

async function readSvgFiles(paths: Array<string>): Promise<Array<SvgFile>> {
  const used: Record<string, true> = {};
  const result: Array<SvgFile> = [];
  for (const path of paths.sort()) {
    const svgFile: SvgFile = await readSvgFile(path);
    const {componentName} = svgFile;
    if (used[componentName] === true)
      throw new Error(`Name clash \`${componentName}\`: ${path}`);
    used[componentName] = true;
    result.push(svgFile);
  }
  return result;
}

async function readSvgFile(filePath: string): Promise<SvgFile> {
  let width = 0;
  let height = 0;

  const baseName = basename(filePath, extname(filePath));
  const svgString = await fs.readFile(filePath, 'utf8');
  const result = optimize(svgString, {
    plugins: [
      {
        name: 'get-svg-size',
        fn: function () {
          return {
            element: {
              enter: (node, parentNode) => {
                if (parentNode.type === 'root') {
                  width = parseInt(node.attributes.width, 10)
                  height = parseInt(node.attributes.height, 10)
                }
              }
            }
          }
        },
      },
      {
        name: 'convertPathData',
        params: {
          floatPrecision: 5,
        }
      },
    ],
  });

  if (width === null)
    throw new Error('`width` is `null`');
  if (height === null)
    throw new Error('`height` is `null`');
  if (width !== height)
    throw new Error(`Different \`width\` and \`height\`: ${filePath}`);
  return {
    dimension: width,
    svgPath: extractSvgPath(result.data, filePath),
    baseName: slugify(`icon-${baseName}-${width}`),
    componentName: camelcase(`Icon ${baseName} ${width}`, {pascalCase: true}),
  };
}

async function writeComponents(files: Array<SvgFile>, path: string): Promise<void> {
  for (const {baseName, componentName, svgPath, dimension} of files) {
    const contents = `import {createIcon} from '../create-icon'
export const ${componentName} = createIcon(
  '${svgPath}',
  { height: ${dimension}, width: ${dimension} }
)
`;
    const filePath = join(path, `${baseName}.ts`);
    await writeTsFileAsync(filePath, contents);
  }
}

async function writeTsFileAsync(path: string, contents: string): Promise<void> {
  await writeFileAsync(path, `// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.\n${contents}`);
}

function extractSvgPath(svgString: string, filePath: string): string {
  const result: Array<string> = [];
  const matches = svgString.matchAll(/ d="([^"]+)"/g);
  for (const match of matches)
    result.push(match[1]);
  if (result.length === 0)
    throw new Error(`No paths in ${filePath}`);
  if (result.length > 1)
    throw new Error(`More than 1 \`path\` in ${filePath}`);
  return result[0];
}

function groupSvgFilesByDimension(files: Array<SvgFile>): Record<string, Array<SvgFile>> {
  const result: Record<string, Array<SvgFile>> = {}
  for (const file of files) {
    const dimension = `${file.dimension}`;
    if (typeof result[dimension] === 'undefined')
      result[dimension] = [];
    result[dimension].push(file);
  }
  return result;
}
