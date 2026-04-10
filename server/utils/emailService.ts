import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `"OfficeFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${process.env.APP_URL}/verify-email?token=${token}`;
  const html = `
    <h1>Verify Your Email</h1>
    <p>Please click the link below to verify your email address for OfficeFlow:</p>
    <a href="${url}">${url}</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(email, 'Verify Your Email - OfficeFlow', html);
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const url = `${process.env.APP_URL}/reset-password?token=${token}`;
  const html = `
    <h1>Reset Your Password</h1>
    <p>You requested a password reset. Please click the link below to set a new password:</p>
    <a href="${url}">${url}</a>
    <p>This link will expire in 15 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(email, 'Reset Your Password - OfficeFlow', html);
};
