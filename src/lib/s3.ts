import { sha256 } from 'js-sha256';

import { env } from './env';

/**
 * Uploads straight from the app to S3, signed with AWS Signature V4.
 *
 * The party chose this over a server-side presigned URL (2026-09-19). The
 * trade-off it accepts: `EXPO_PUBLIC_*` values are compiled into the shipped
 * app, so the access key and secret can be read out of any installed copy.
 * Keep the IAM user for this key limited to `s3:PutObject` on
 * `wp-membership-bucket/members/*` so a leaked key can do nothing else, and
 * rotate it whenever it has been shared.
 *
 * Signing is done by hand with a pure-JS HMAC: React Native has no
 * `crypto.subtle`, so the AWS SDK's signer cannot run here.
 */

const SERVICE = 's3';
const ALGORITHM = 'AWS4-HMAC-SHA256';

export class S3NotConfiguredError extends Error {
  constructor() {
    super('s3-not-configured');
    this.name = 'S3NotConfiguredError';
  }
}

export class S3UploadError extends Error {
  constructor(readonly status: number, body: string) {
    super(`s3-upload-failed-${status}: ${body.slice(0, 300)}`);
    this.name = 'S3UploadError';
  }
}

export function isS3Configured(): boolean {
  return Boolean(
    env.s3.region && env.s3.publicUrlBase && env.s3.accessKeyId && env.s3.secretAccessKey
  );
}

/** "20260919T162152Z" and "20260919", the two forms SigV4 asks for. */
function timestamps(now: Date): { amzDate: string; dateStamp: string } {
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  return { amzDate, dateStamp: amzDate.slice(0, 8) };
}

/** Each path segment is encoded, but the separators stay. */
function encodeKey(key: string): string {
  return key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function signingKey(secret: string, dateStamp: string, region: string): ArrayBuffer {
  const kDate = sha256.hmac.arrayBuffer(`AWS4${secret}`, dateStamp);
  const kRegion = sha256.hmac.arrayBuffer(kDate, region);
  const kService = sha256.hmac.arrayBuffer(kRegion, SERVICE);
  return sha256.hmac.arrayBuffer(kService, 'aws4_request');
}

/**
 * Puts an object and returns its public URL.
 *
 * No ACL header is sent: buckets now block ACLs by default, so public reads
 * have to come from the bucket policy instead.
 */
export async function putObject(params: {
  key: string;
  body: ArrayBuffer;
  contentType: string;
}): Promise<string> {
  if (!isS3Configured()) throw new S3NotConfiguredError();

  const { region, accessKeyId, secretAccessKey, publicUrlBase } = env.s3;
  const base = publicUrlBase.replace(/\/$/, '');
  const host = base.replace(/^https?:\/\//, '').split('/')[0];
  const url = `${base}/${encodeKey(params.key)}`;

  const { amzDate, dateStamp } = timestamps(new Date());
  const payloadHash = sha256.hex(params.body);
  const scope = `${dateStamp}/${region}/${SERVICE}/aws4_request`;
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

  const canonicalRequest = [
    'PUT',
    `/${encodeKey(params.key)}`,
    '',
    `content-type:${params.contentType}`,
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
    '',
    signedHeaders,
    payloadHash,
  ].join('\n');

  const stringToSign = [ALGORITHM, amzDate, scope, sha256.hex(canonicalRequest)].join('\n');
  const signature = sha256.hmac.hex(
    signingKey(secretAccessKey, dateStamp, region),
    stringToSign
  );

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': params.contentType,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      Authorization: `${ALGORITHM} Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    body: params.body,
  });

  if (!response.ok) throw new S3UploadError(response.status, await response.text());
  return url;
}
