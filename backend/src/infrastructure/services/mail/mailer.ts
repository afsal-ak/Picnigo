import nodemailer from 'nodemailer';

import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpMail = async (to: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your OTP Code for Picnigo',
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log('s');

    console.error(` Failed to send OTP email: ${(error as Error).message}`);
    throw new Error('Failed to send OTP email');
  }
};
