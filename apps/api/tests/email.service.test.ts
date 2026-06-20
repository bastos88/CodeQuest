import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendEmail = vi.hoisted(() => vi.fn());
const mockedEnv = vi.hoisted(() => ({
  NODE_ENV: 'production' as 'development' | 'test' | 'production',
  RESEND_API_KEY: 'test-resend-key',
  EMAIL_FROM: 'CodeQuest <noreply@example.com>',
  PASSWORD_RESET_TOKEN_EXPIRES_MINUTES: 60,
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendEmail };
  },
}));

vi.mock('../src/config/env.js', () => ({ env: mockedEnv }));

const { sendPasswordResetEmail } = await import('../src/services/email.service.js');

describe('password reset email service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedEnv.NODE_ENV = 'production';
    mockedEnv.RESEND_API_KEY = 'test-resend-key';
    mockedEnv.EMAIL_FROM = 'CodeQuest <noreply@example.com>';
  });

  it('accepts delivery only when Resend returns an id', async () => {
    sendEmail.mockResolvedValue({ data: { id: 'email-123' }, error: null });
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    await expect(
      sendPasswordResetEmail({
        to: 'user@example.com',
        userName: 'Code User',
        resetUrl: 'https://codequest.example/reset-password?token=secret',
      }),
    ).resolves.toBeUndefined();

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: mockedEnv.EMAIL_FROM,
        to: 'user@example.com',
        subject: 'Redefina sua senha do CodeQuest',
      }),
    );
    expect(infoSpy).toHaveBeenCalledWith(
      '[PASSWORD RESET] E-mail aceito pelo provedor',
      { resendId: 'email-123' },
    );
    infoSpy.mockRestore();
  });

  it('rejects a provider error instead of reporting success', async () => {
    sendEmail.mockResolvedValue({
      data: null,
      error: { name: 'validation_error', message: 'Sender domain is not verified' },
    });

    await expect(
      sendPasswordResetEmail({
        to: 'user@example.com',
        resetUrl: 'https://codequest.example/reset-password?token=secret',
      }),
    ).rejects.toThrow('Sender domain is not verified');
  });

  it('fails clearly in production when configuration is absent', async () => {
    mockedEnv.RESEND_API_KEY = '';

    await expect(
      sendPasswordResetEmail({
        to: 'user@example.com',
        resetUrl: 'https://codequest.example/reset-password?token=secret',
      }),
    ).rejects.toThrow('Configuração de e-mail transacional ausente');
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
