import nodemailer from 'nodemailer';

// Create a test transporter using Ethereal Email (for development)
// For production, replace with your email service (SendGrid, AWS SES, etc.)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/** Owner account that can view /admin/messages. */
export const OWNER_EMAIL = process.env.OWNER_EMAIL || 'business@cenitapp.org';

/** Where contact-form notifications are emailed (defaults to the owner email). */
export const CONTACT_NOTIFY_TO = process.env.CONTACT_NOTIFY_TO || OWNER_EMAIL;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Notify the owner of a new contact-form submission. Returns true on success. */
export async function sendContactNotification(msg: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@cenitapp.org',
      to: CONTACT_NOTIFY_TO,
      replyTo: msg.email, // hit "Reply" to answer the visitor directly
      subject: `New contact message: ${msg.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #16263F;">
          <h2 style="margin: 0 0 4px;">New message via Cenit contact form</h2>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">${esc(msg.subject)}</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr><td style="padding: 6px 0; color: #6b7280; width: 90px;">From</td><td style="padding: 6px 0; font-weight: 600;">${esc(msg.name)}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Email</td><td style="padding: 6px 0;"><a href="mailto:${esc(msg.email)}" style="color: #B68A3E;">${esc(msg.email)}</a></td></tr>
          </table>
          <div style="margin-top: 20px; padding: 16px 18px; background: #F5F1E8; border-radius: 10px; white-space: pre-wrap; line-height: 1.6;">${esc(msg.message)}</div>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Reply to this email to respond to ${esc(msg.name)} directly.</p>
        </div>`,
      text: `New message via Cenit contact form\nSubject: ${msg.subject}\nFrom: ${msg.name} <${msg.email}>\n\n${msg.message}\n`,
    });
    return true;
  } catch (error) {
    console.error('Failed to send contact notification:', error);
    return false;
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@luxegather.com',
      to: email,
      subject: 'Verify your LuxeGather email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16263F;">Verify Your Email</h2>
          <p style="color: #666; font-size: 16px;">Welcome to LuxeGather! Please verify your email to complete your account setup.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <p style="color: #333; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 2px;">${token}</p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">Copy this code or click the button below</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background-color: #B0832E; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">Verify Email</a>
          </div>
          
          <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
        </div>
      `,
      text: `
        Verify Your Email

        Welcome to LuxeGather! Please verify your email to complete your account setup.

        Verification Code: ${token}

        Or visit this link: ${verificationUrl}

        This link will expire in 24 hours.

        If you didn't create this account, please ignore this email.
      `,
    });

    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@luxegather.com',
      to: email,
      subject: 'Reset your LuxeGather password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16263F;">Reset Your Password</h2>
          <p style="color: #666; font-size: 16px;">You requested a password reset. Click the button below to create a new password.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #B0832E; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset Password</a>
          </div>
          
          <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}
