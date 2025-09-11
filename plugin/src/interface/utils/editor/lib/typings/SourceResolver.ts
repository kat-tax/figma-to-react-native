import {fs} from '@zip.js/zip.js';
import {F2RN_EXO_TYPE_ZIP} from 'config/consts';

import type {SourceResolver as SourceResolverBase} from 'monaco-editor-auto-typings/custom-editor';
import type {ZipDirectoryEntry, ZipFileEntry} from '@zip.js/zip.js';

const CACHE_ONLY = [
  'react',
  'react-exo',
  'react-dom',
  'react-native',
  'react-native-svg',
  'react-native-unistyles',
  'prop-types',
  'csstype',
];

export class SourceResolver implements SourceResolverBase {
  private init = false;
  private root: ZipDirectoryEntry | null = null;
  private local: Map<string, ZipDirectoryEntry> = new Map();

  constructor() {}

  public async initialize(): Promise<void> {
    if (this.init) return;
    try {
      const zip = new fs.FS();
      const entries = await zip.importHttpContent(F2RN_EXO_TYPE_ZIP);
      console.log('>>> [source-resolver:initialize]', entries);
      this.root = entries[0] as ZipDirectoryEntry;
      this.init = true;
    } catch (error) {
      console.error('Error initializing local package resolver:', error);
    }
  }

  public async resolvePackageJson(
    packageName: string,
    version: string | undefined,
    subPath: string | undefined
  ): Promise<string | undefined> {
    await this.initialize();

    const localContent = await this.resolveLocal(
      packageName,
      subPath ? `${subPath}/package.json` : 'package.json'
    );

    console.log('>>> [source-resolver:resolvePackageJson]', packageName, version, subPath, localContent);

    if (localContent !== undefined) {
      return localContent;
    }

    if (CACHE_ONLY.includes(packageName)) {
      return undefined;
    }

    // Fallback to unpkg
    const url = `https://unpkg.com/${packageName}${version ? `@${version}` : ''}${subPath ? `/${subPath}` : ''}/package.json`;
    return await this.resolveRemote(url);
  }

  public async resolveSourceFile(
    packageName: string,
    version: string | undefined,
    path: string
  ): Promise<string | undefined> {
    await this.initialize();

    const localContent = await this.resolveLocal(packageName, path);

    if (localContent !== undefined) {
      return localContent;
    }

    if (CACHE_ONLY.includes(packageName)) {
      return undefined;
    }

    // Fallback to unpkg
    const url = `https://unpkg.com/${packageName}${version ? `@${version}` : ''}/${path}`;
    return await this.resolveRemote(url);
  }

  private async resolveLocal(
    packageName: string,
    filePath: string
  ): Promise<string | undefined> {
    try {
      // Get the package directory
      let packageDir: ZipDirectoryEntry;

      if (this.local.has(packageName)) {
        packageDir = this.local.get(packageName)!;
      } else {
        packageDir = this.root!.getChildByName(packageName) as ZipDirectoryEntry;
        if (!packageDir) {
          return undefined;
        }
        this.local.set(packageName, packageDir);
      }

      // Navigate to the file
      const pathParts = filePath.split('/');
      let currentDir: ZipDirectoryEntry = packageDir;

      // Navigate through directories
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        const nextDir = currentDir.getChildByName(part) as ZipDirectoryEntry;
        if (!nextDir) {
          return undefined;
        }
        currentDir = nextDir;
      }

      // Get the file
      const fileName = pathParts[pathParts.length - 1];
      const file = currentDir.getChildByName(fileName) as ZipFileEntry<string, string>;
      if (!file) {
        return undefined;
      }

      return await file.getText('utf-8');
    } catch (error) {
      console.error(`Error resolving local package ${packageName}:`, error);
      return undefined;
    }
  }

  private async resolveRemote(url: string) {
    const res = await fetch(url, {method: 'GET'});
    if (res.ok) return await res.text();
    if (res.status === 404) return '';
    throw Error(`Error other than 404 while fetching from Unpkg at ${url}`);
  }
}
