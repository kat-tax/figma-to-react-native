import {constants, log, readConfigAsync} from '@create-figma-plugin/common';
import {yellow} from 'kleur/colors';
import {watch} from 'chokidar';

import {buildBundlesAsync} from '../utilities/build-bundles-async/build-bundles-async.js';
import {buildCssModulesTypingsAsync} from '../utilities/build-css-modules-typings-async.js';
import {buildManifestAsync} from '../utilities/build-manifest-async.js';
import {typeCheckWatch} from '../utilities/type-check/type-check-watch.js';
import {trackElapsedTime} from '../utilities/track-elapsed-time.js';
import {watchIgnoreRegex} from './watch-ignore-regex.js';

import type {BuildOptions} from '../types/build.js';

const cssRegex = /\.css$/
const packageJsonRegex = /^package\.json$/

const mapChokidarWatchEventToLabel: Record<string, string> = {
  add: 'Added',
  change: 'Changed',
  unlink: 'Deleted'
}

export async function watchAsync(options: BuildOptions): Promise<void> {
  const { minify, outputDirectory, typecheck } = options
  let endTypeCheckWatch: () => void
  if (typecheck === true) {
    endTypeCheckWatch = typeCheckWatch()
  }
  const watcher = watch(
    [
      '**/*.{css,gif,jpeg,jpg,js,json,jsx,png,ts,tsx,tpl}',
      constants.build.mainConfigGlobPattern,
      constants.build.manifestConfigGlobPattern,
      constants.build.uiConfigGlobPattern,
      'package.json',
      'tsconfig.json'
    ],
    {
      ignored: function (path: string): boolean {
        return watchIgnoreRegex.test(path) === true
      }
    }
  )

  watcher.on('ready', function (): void {
    if (typecheck === false) {
      log.info('Watching...')
    }

    watcher.on(
      'all',
      async function (event: string, file: string): Promise<void> {
        if (typeof mapChokidarWatchEventToLabel[event] === 'undefined') {
          return
        }
        try {
          const config = await readConfigAsync()
          if (typecheck === true && file.indexOf('tsconfig.json') !== -1) {
            endTypeCheckWatch()
          }
          log.clearViewport()
          const getElapsedTime = trackElapsedTime()
          log.info(`${mapChokidarWatchEventToLabel[event]} ${yellow(file)}`)
          const promises: Array<Promise<void>> = []
          if (packageJsonRegex.test(file) === true) {
            promises.push(
              buildManifestAsync({ config, minify, outputDirectory })
            )
          } else {
            if (cssRegex.test(file) === true) {
              promises.push(buildCssModulesTypingsAsync())
            }
          }
          promises.push(buildBundlesAsync({ config, minify, outputDirectory }))
          await Promise.all(promises)
          log.success(`Built in ${getElapsedTime()}`)
          if (typecheck === false) {
            log.info('Watching...')
            return
          }
          if (file.indexOf('tsconfig.json') !== -1) {
            // Restart the type-check watcher program
            endTypeCheckWatch = typeCheckWatch()
          }
        } catch (error: any) {
          log.error(error.message)
        }
      }
    )
  })
}
