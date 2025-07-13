import nodemailer from 'nodemailer';

// Check if email credentials are configured
const isEmailConfigured = () => {
  return process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
};

// Create transporter for sending emails
const createTransporter = () => {
  if (!isEmailConfigured()) {
    console.warn('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail', // You can change this to your preferred email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
    },
  });
};

const transporter = createTransporter();

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    if (!transporter) {
      throw new Error('Email transporter not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

export const sendVerificationEmail = async (email: string, token: string, name: string) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Together We Can!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for registering with us. To complete your registration and verify your email address, please click the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      
      <p>This link will expire in 24 hours for security reasons.</p>
      
      <p>If you didn't create an account with us, please ignore this email.</p>
      
      <p>Best regards,<br>The Together We Can Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email Address - Together We Can',
    html,
  });
}; 