import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // use STARTTLS
  auth: {
    user: process.env.EMAIL_USER, // careers@vardhmanairports.com
    pass: process.env.EMAIL_PASS  // your email account password or app password if 2FA is enabled
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Failed:', error);
  } else {
    console.log('✅ Connected successfully to Gmail SMTP');
  }
});
