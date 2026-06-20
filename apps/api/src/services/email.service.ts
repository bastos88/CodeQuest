import { Resend } from 'resend';
import { env } from '../config/env.js';

export type SendPasswordResetEmailInput = {
  to: string;
  userName?: string | null;
  resetUrl: string;
};

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName,
}: SendPasswordResetEmailInput): Promise<void> {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    if (env.NODE_ENV !== 'production') {
      console.info(
        '[EMAIL] Envio real não configurado: defina RESEND_API_KEY e EMAIL_FROM.',
      );
      console.info(`[EMAIL] Link de recuperação local: ${resetUrl}`);
      return;
    }

    throw new Error(
      'Configuração de e-mail transacional ausente no ambiente de produção.',
    );
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const greeting = userName?.trim()
    ? `Olá, ${escapeHtml(userName.trim())}.`
    : 'Olá.';
  const safeResetUrl = escapeHtml(resetUrl);
  const expirationMinutes = env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES;

  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: 'Redefina sua senha do CodeQuest',
    html: `
      <div style="margin:0;background:#0a0b0f;padding:32px 16px;font-family:Arial,sans-serif;color:#f2f4f8">
        <div style="max-width:560px;margin:0 auto;background:#14151c;border:1px solid #2a2d38;border-radius:20px;padding:32px;box-sizing:border-box">
          <h1 style="margin:0 0 18px;font-size:26px;line-height:1.25">Redefina sua senha do CodeQuest</h1>
          <p style="margin:0 0 12px;color:#b7bdc9;line-height:1.6">${greeting}</p>
          <p style="margin:0;color:#b7bdc9;line-height:1.6">Recebemos uma solicitação para redefinir a senha da sua conta.</p>
          <a href="${safeResetUrl}" style="display:inline-block;margin:24px 0;padding:14px 22px;border-radius:14px;background:#6c63ff;color:#ffffff;text-decoration:none;font-weight:700">Redefinir senha</a>
          <p style="margin:0 0 12px;color:#b7bdc9;line-height:1.6">Este link expira em ${expirationMinutes} minutos e pode ser usado apenas uma vez.</p>
          <p style="margin:0 0 8px;color:#7f8491;line-height:1.6">Se o botão não funcionar, copie este endereço:</p>
          <p style="margin:0 0 20px;word-break:break-all"><a href="${safeResetUrl}" style="color:#9da7ff">${safeResetUrl}</a></p>
          <p style="margin:0;color:#7f8491;line-height:1.6">Se você não solicitou esta alteração, ignore este e-mail.</p>
        </div>
      </div>
    `,
    text: `${userName?.trim() ? `Olá, ${userName.trim()}. ` : ''}Redefina sua senha do CodeQuest: ${resetUrl}\n\nO link expira em ${expirationMinutes} minutos e pode ser usado apenas uma vez. Se você não solicitou esta alteração, ignore este e-mail.`,
  });

  if (error) {
    throw new Error(
      `Resend recusou o envio: ${error.name ?? 'provider_error'} - ${error.message}`,
    );
  }

  if (!data?.id) {
    throw new Error('Resend não retornou um identificador de envio.');
  }

  console.info('[PASSWORD RESET] E-mail aceito pelo provedor', {
    resendId: data.id,
  });
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[character] ?? character,
  );
}
