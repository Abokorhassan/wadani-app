/**
 * The algorithm itself was checked against the real bucket (a wrong signature
 * is a 403 from S3). These tests pin the request it builds, so a refactor
 * cannot quietly break the parts S3 is strict about.
 */
const CONFIG = {
  EXPO_PUBLIC_S3_REGION: 'eu-north-1',
  EXPO_PUBLIC_S3_BUCKET: 'wp-membership-bucket',
  EXPO_PUBLIC_S3_PUBLIC_URL_BASE: 'https://wp-membership-bucket.s3.eu-north-1.amazonaws.com',
  EXPO_PUBLIC_AWS_ACCESS_KEY_ID: 'AKIAEXAMPLE',
  EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY: 'secretexample',
};

function loadS3(config: Record<string, string> = CONFIG) {
  let module!: typeof import('./s3');
  jest.isolateModules(() => {
    Object.assign(process.env, config);
    module = require('./s3');
  });
  return module;
}

const clearConfig = () =>
  Object.fromEntries(Object.keys(CONFIG).map((key) => [key, ''])) as Record<string, string>;

describe('S3 upload', () => {
  afterEach(() => {
    Object.assign(process.env, clearConfig());
    jest.restoreAllMocks();
  });

  it('refuses to upload when the bucket is not configured', () => {
    const { isS3Configured } = loadS3(clearConfig());
    expect(isS3Configured()).toBe(false);
  });

  it('signs the PUT the way S3 expects, and returns the public URL', async () => {
    const { putObject } = loadS3();
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true, status: 200, text: async () => '' } as Response);

    const url = await putObject({
      key: 'members/1-abc.jpg',
      body: new TextEncoder().encode('photo').buffer as ArrayBuffer,
      contentType: 'image/jpeg',
    });

    expect(url).toBe(
      'https://wp-membership-bucket.s3.eu-north-1.amazonaws.com/members/1-abc.jpg'
    );

    const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(calledUrl).toBe(url);
    expect(init.method).toBe('PUT');
    // The payload hash is signed as well as sent, so it has to be the body's.
    expect(headers['x-amz-content-sha256']).toMatch(/^[0-9a-f]{64}$/);
    expect(headers['x-amz-date']).toMatch(/^\d{8}T\d{6}Z$/);
    expect(headers.Authorization).toMatch(
      /^AWS4-HMAC-SHA256 Credential=AKIAEXAMPLE\/\d{8}\/eu-north-1\/s3\/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=[0-9a-f]{64}$/
    );
    // No ACL header: the bucket serves photos through its policy instead.
    expect(headers['x-amz-acl']).toBeUndefined();
  });

  it('reports what S3 said when it rejects the upload', async () => {
    const { putObject, S3UploadError } = loadS3();
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => '<Error><Code>AccessDenied</Code></Error>',
    } as Response);

    await expect(
      putObject({
        key: 'members/x.jpg',
        body: new ArrayBuffer(4),
        contentType: 'image/jpeg',
      })
    ).rejects.toBeInstanceOf(S3UploadError);
  });
});
