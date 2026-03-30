import nodemailer from 'nodemailer'

function getSmtpTransport() {
  if (process.env.SMTP_URL) {
    return nodemailer.createTransport(process.env.SMTP_URL)
  }

  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    })
  }

  return null
}

export function isMailConfigured() {
  return Boolean(process.env.SMTP_URL || (process.env.SMTP_HOST && process.env.SMTP_PORT))
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string
  resetUrl: string
}) {
  const transporter = getSmtpTransport()
  if (!transporter) {
    console.info('[forgot-password] SMTP is not configured. Reset URL:', resetUrl)
    return
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'CalHub <no-reply@calhub.local>',
    to,
    subject: 'Reset your CalHub password',
    text: `You requested a password reset for your CalHub account.\n\nOpen this link to choose a new password:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #161617;">
        <h2 style="margin: 0 0 12px;">Reset your CalHub password</h2>
        <p>You requested a password reset for your CalHub account.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 20px; border-radius: 999px; background: #F57A4A; color: white; text-decoration: none; font-weight: 600;">
            Reset password
          </a>
        </p>
        <p style="font-size: 14px; color: #6F6A60;">
          This link expires in 1 hour. If you did not request this, you can ignore this email.
        </p>
        <p style="font-size: 12px; color: #9C968B;">${resetUrl}</p>
      </div>
    `,
  })
}
