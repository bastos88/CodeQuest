import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resend } from 'resend';

dotenv.config({
  path: path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../.env',
  ),
});

const destination = process.argv[2]?.trim();
const resendApiKey = process.env.RESEND_API_KEY?.trim();
const emailFrom = process.env.EMAIL_FROM?.trim();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const senderPattern =
  /^(?:[^<>]+\s*)?<[^<>\s]+@[^<>\s]+\.[^<>\s]+>$|^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!destination || !emailPattern.test(destination)) {
  console.error('Informe um e-mail de destino válido.');
  console.error(
    'Uso: npx tsx apps/api/src/scripts/test-email.ts seu-email@exemplo.com',
  );
  process.exitCode = 1;
} else if (!resendApiKey) {
  console.error('Falha no envio: RESEND_API_KEY não está configurada.');
  process.exitCode = 1;
} else if (!emailFrom || !senderPattern.test(emailFrom)) {
  console.error(
    'Falha no envio: EMAIL_FROM está ausente ou possui formato inválido.',
  );
  process.exitCode = 1;
} else {
  const resend = new Resend(resendApiKey);
  const { data, error } = await resend.emails.send({
    from: emailFrom,
    to: [destination],
    subject: 'Teste de e-mail do CodeQuest',
    html: `
      <div style="background:#0a0b0f;padding:32px;font-family:Arial,sans-serif;color:#f4f7fb">
        <div style="max-width:560px;margin:0 auto;border:1px solid #2a2d38;border-radius:18px;background:#14151c;padding:28px">
          <h1 style="margin:0 0 14px;font-size:24px">CodeQuest</h1>
          <p style="margin:0;color:#b7bdc9;line-height:1.6">O provedor de e-mail transacional está configurado corretamente.</p>
        </div>
      </div>
    `,
    text: 'CodeQuest: o provedor de e-mail transacional está configurado corretamente.',
  });

  if (error) {
    console.error('Falha no envio.');
    console.error(
      `Motivo: ${error.name ?? 'provider_error'} - ${error.message}`,
    );
    process.exitCode = 1;
  } else if (!data?.id) {
    console.error('Falha no envio: o Resend não retornou um identificador.');
    process.exitCode = 1;
  } else {
    console.info('E-mail aceito pelo Resend.');
    console.info(`Resend ID: ${data.id}`);
  }
}
