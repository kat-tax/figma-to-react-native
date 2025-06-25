import {log, readConfigAsync} from '@create-figma-plugin/common';

import {buildBundlesAsync} from './utilities/build-bundles-async/build-bundles-async.js';
import {buildCssModulesTypingsAsync} from './utilities/build-css-modules-typings-async.js';
import {buildManifestAsync} from './utilities/build-manifest-async.js';
import {trackElapsedTime} from './utilities/track-elapsed-time.js';
import {typeCheckBuild} from './utilities/type-check/type-check-build.js';

import type {BuildOptions} from './types/build.js';

export async function buildAsync(
  options: BuildOptions & { clearPreviousLine: boolean; exitOnError: boolean }
): Promise<void> {
  const { minify, outputDirectory, typecheck, clearPreviousLine, exitOnError } =
    options
  const config = await readConfigAsync()
  try {
    if (typecheck === true) {
      const getTypeCheckElapsedTime = trackElapsedTime()
      await buildCssModulesTypingsAsync() // This must occur before `typeCheckBuild`
      log.info('Typechecking...')
      typeCheckBuild()
      const typeCheckElapsedTime = getTypeCheckElapsedTime()
      log.success(`Typechecked in ${typeCheckElapsedTime}`, {
        clearPreviousLine
      })
      log.info('Building...')
      const getBuildElapsedTime = trackElapsedTime()
      await Promise.all([
        buildBundlesAsync({ config, minify, outputDirectory }),
        buildManifestAsync({ config, minify, outputDirectory })
      ])
      const buildElapsedTime = getBuildElapsedTime()
      log.success(`Built in ${buildElapsedTime}`, { clearPreviousLine })
    } else {
      log.info('Building...')
      const getBuildElapsedTime = trackElapsedTime()
      await Promise.all([
        buildCssModulesTypingsAsync(),
        buildBundlesAsync({ config, minify, outputDirectory }),
        buildManifestAsync({ config, minify, outputDirectory })
      ])
      const buildElapsedTime = getBuildElapsedTime()
      log.success(`Built in ${buildElapsedTime}`, { clearPreviousLine })
    }
  } catch (error: any) {
    log.error(error.message)
    if (exitOnError === true) {
      process.exit(1)
    }
  }
}
