const nodemailer = require('nodemailer');

async function sendResetEmail(to, token) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.log(`Password reset token for ${to}: ${token}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Finanzas Fáciles - Recuperar contraseña',
    text: `Haz clic para restablecer tu contraseña: ${resetUrl}`,
  });
}

module.exports = { sendResetEmail };
