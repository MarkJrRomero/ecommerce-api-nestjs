import { Resend } from 'resend';
import * as dotenv from 'dotenv';
dotenv.config();

const RESEND_KEY = process.env.RESEND_KEY;

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!RESEND_KEY) {
    console.error('RESEND_KEY is not set');
    return;
  }

  const resend = new Resend(RESEND_KEY);

  const result = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject: `E-Commerce App - ${subject}`,
    html,
  });

  console.log(result);
};

export { sendEmail };
