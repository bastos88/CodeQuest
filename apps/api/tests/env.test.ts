import { afterEach, describe, expect, it, vi } from 'vitest';

describe('production environment validation', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('rejects weak JWT secrets in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv(
      'DATABASE_URL',
      'postgresql://user:password@localhost:5432/codequest',
    );
    vi.stubEnv('JWT_ACCESS_SECRET', 'short');
    vi.stubEnv('JWT_REFRESH_SECRET', 'short');

    await expect(import('../src/config/env.js')).rejects.toThrow();
  });
});
