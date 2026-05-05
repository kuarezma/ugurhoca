import { GET } from '@/app/api/image-proxy/route';

describe('GET /api/image-proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when hostname is not allowlisted', async () => {
    const response = await GET(
      new Request('http://localhost/api/image-proxy?url=https%3A%2F%2Fexample.com%2Fa.jpg'),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Hostname is not allowlisted',
    });
  });

  it('returns 413 when content-length exceeds limit', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]).buffer, {
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
          'content-length': String(9 * 1024 * 1024),
        },
      }),
    );

    const response = await GET(
      new Request(
        'http://localhost/api/image-proxy?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-test',
      ),
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      error: 'Image too large',
    });
  });

  it('proxies allowlisted image urls', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]).buffer, {
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      }),
    );

    const response = await GET(
      new Request(
        'http://localhost/api/image-proxy?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-test',
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/jpeg');
  });
});
