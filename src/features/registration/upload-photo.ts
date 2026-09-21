import { File } from 'expo-file-system';

import { isS3Configured, putObject, S3NotConfiguredError } from '@/lib/s3';

/**
 * Turns the photo the member picked into a URL the backend can store.
 *
 * `POST /mobile/auth/register` takes `photoUrl`, not a file, so the picture
 * goes to the party's S3 bucket first and the public URL goes in the payload.
 * The upload is signed in the app (party decision, 2026-09-19); see the note
 * in src/lib/s3.ts about what that exposes.
 */
export class PhotoUploadUnavailableError extends Error {
  constructor() {
    super('photo-upload-unavailable');
    this.name = 'PhotoUploadUnavailableError';
  }
}

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  heic: 'image/heic',
  heif: 'image/heif',
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

function extensionOf(uri: string): string {
  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  return extension in CONTENT_TYPES ? extension : 'jpg';
}

/** Unguessable, so one member's photo URL says nothing about another's. */
function photoKey(extension: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `members/${Date.now()}-${random}.${extension}`;
}

/**
 * Mock mode is not considered here on purpose: it stands in for the *API*, and
 * the upload does not go through the API. Registering against the mock still
 * uploads for real, which is the only way to exercise this path before the
 * backend is live. It leaves the odd test photo in `members/`.
 */
export async function uploadMemberPhoto(localUri: string): Promise<string> {
  if (!isS3Configured()) throw new PhotoUploadUnavailableError();

  const extension = extensionOf(localUri);

  try {
    const body = await new File(localUri).arrayBuffer();
    return await putObject({
      key: photoKey(extension),
      body,
      contentType: CONTENT_TYPES[extension],
    });
  } catch (error) {
    if (error instanceof S3NotConfiguredError) throw new PhotoUploadUnavailableError();
    throw error;
  }
}
