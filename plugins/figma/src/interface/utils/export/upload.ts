// TODO: replace uppy with tus-js-client
// @see: https://supabase.com/docs/guides/storage/uploads#resumable-upload

import {SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY} from 'config/env';
import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import {zip} from './zip';

import type {UploadResult} from '@uppy/core';
import type {ProjectBuild, ProjectRelease} from 'types/project';

const UPLOAD_ENDPOINT = `${SUPABASE_PROJECT_URL}/storage/v1/upload/resumable`;
const UPLOAD_CHUNK_SIZE = 6 * 1024 * 1024;

export async function upload(
  project: ProjectBuild,
  release: ProjectRelease,
): Promise<UploadResult<Record<string, unknown>, Record<string, unknown>>> {
  return new Promise(async (resolve, reject) => {  
    const uploader = init();
    const path = `${release.apiKey}/${Date.now()}.zip`;

    uploader.on('complete', (result) => {
      resolve(result);
      console.debug('[upload] complete', result);
    });

    uploader.on('error', (error) => {
      reject(error);
      console.error('[upload] failed', error);
    });

    uploader.addFile({
      name: path,
      type: 'application/zip',
      data: await zip(project, release),
    });
  });
}

export function init() {
  const uppy = new Uppy({
    autoProceed: true,
  });
  
  uppy.use(Tus, {
    endpoint: UPLOAD_ENDPOINT,
    chunkSize: UPLOAD_CHUNK_SIZE,
    uploadDataDuringCreation: true,
    headers: {
      authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    allowedMetaFields: [
      'contentType',
      'objectName',
      'bucketName',
      'cacheControl',
    ],
  });
    
  uppy.on('file-added', (file) => {
    file.meta = {
      ...file.meta,
      contentType: file.type,
      objectName: file.name,
      bucketName: 'releases',
      cacheControl: 3600,
    };
  });

  return uppy;
}
