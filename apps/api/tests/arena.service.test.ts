import { describe, expect, it } from 'vitest';
import { startArena, submitArena } from '../src/services/arena.service.js';

describe('arena availability guard', () => {
  it('does not create matches while the server-authoritative flow is unavailable', async () => {
    await expect(startArena('user-id')).rejects.toMatchObject({
      statusCode: 503,
    });
  });

  it('does not accept client-provided scores', async () => {
    await expect(submitArena('user-id', 'match-id', 10)).rejects.toMatchObject({
      statusCode: 503,
    });
  });
});
