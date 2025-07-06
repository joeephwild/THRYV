import nodemailer from 'nodemailer';

// In a production environment, you would use a real email service
// For development, we can use a test account or ethereal email

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Get email configuration from environment variables
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = options.from || process.env.EMAIL_FROM || 'noreply@thryv.app';

  // Create transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  // Send email
  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const generateVerificationEmail = (name: string, verificationUrl: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #6C63FF; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">THRYV</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
        <h2>Verify Your Email Address</h2>
        <p>Hi ${name},</p>
        <p>Thank you for signing up with THRYV! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #6C63FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
        </div>
        <p>If you didn't create an account with THRYV, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The THRYV Team</p>
      </div>
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} THRYV. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const generatePasswordResetEmail = (name: string, resetUrl: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #6C63FF; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">THRYV</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
        <h2>Reset Your Password</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #6C63FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>The THRYV Team</p>
      </div>
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} THRYV. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const generateWelcomeEmail = (name: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #6C63FF; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">THRYV</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
        <h2>Welcome to THRYV!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for joining THRYV! We're excited to help you on your financial journey.</p>
        <p>With THRYV, you can:</p>
        <ul>
          <li>Save money with flexible savings goals</li>
          <li>Build an emergency fund</li>
          <li>Create and manage budgets</li>
          <li>Invest and grow your wealth</li>
          <li>Get personalized financial advice from our AI CFO</li>
        </ul>
        <p>To get started, log in to your account and explore the app!</p>
        <p>Best regards,<br>The THRYV Team</p>
      </div>
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} THRYV. All rights reserved.</p>
      </div>
    </div>
  `;
};