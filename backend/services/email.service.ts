import nodemailer from 'nodemailer';
import {
    EMAIL_HOST,
    EMAIL_PASS,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_USER,
} from '../config';

const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: EMAIL_SECURE === 'true',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
    debug: true,
    logger: true,
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    const mailOptions = {
        from: `"Apartment Management" <${EMAIL_USER}>`,
        to,
        subject,
        html,
    };

    return transporter.sendMail(mailOptions);
};
