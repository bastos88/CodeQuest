import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { allowedWebOrigins } from '../src/config/env.js';

describe('request origin protection', () => {
  it('blocks state-changing requests from an untrusted browser origin', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .set('Origin', 'https://attacker.example');

    expect(response.status).toBe(403);
  });

  it('allows state-changing requests from the configured frontend', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .set('Origin', allowedWebOrigins[0]!);

    expect(response.status).toBe(204);
  });
});
