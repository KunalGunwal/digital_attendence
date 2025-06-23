// src/utils/emailSender.js

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { ApiError } from './ApiError.js'; // Assuming you have ApiError defined

dotenv.config({ path: './.env' }); // Ensure environment variables are loaded

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailFromName = "ABC Public School"

// For Gmail (most common setup with App Passwords)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass, // Use the generated App Password for Gmail
    },
});

/*
// For other SMTP services, you might use:
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10), // Ensure port is parsed as a number
    secure: process.env.EMAIL_SECURE === 'true', // Use 'true' or 'false' in .env
    auth: {
        user: emailUser,
        pass: emailPass,
    },
    // Optional: for self-signed certificates or development environments (not recommended for production)
    // tls: {
    //     rejectUnauthorized: false
    // }
});
*/

/**
 * Sends an email using Nodemailer.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} text - The plain text body of the email.
 * @param {string} [html] - The HTML body of the email (optional).
 * @returns {Promise<object>} - A promise that resolves with information about the sent message.
 * @throws {ApiError} - Throws an ApiError if prerequisites are not met or sending fails.
 */
const sendEmail = async (to, subject, text, html) => {
    if (!emailUser || !emailPass) {
        console.error("Email service credentials are not fully configured in environment variables.");
        throw new ApiError(500, "Email service not configured. Missing credentials.");
    }
    if (!to || !subject || (!text && !html)) {
        throw new ApiError(400, "Recipient email, subject, and at least one of (text or html) body are required to send email.");
    }

    try {
        const mailOptions = {
            from: `"${emailFromName}" <${emailUser}>`, // Sender address
            to: to, // Recipient address
            subject: subject, // Subject line
            text: text, // Plain text body
            html: html, // HTML body (if provided)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Failed to send email to ${to}. Error:`, error.message);
        throw new ApiError(
            500,
            `Failed to send email: ${error.message || 'Unknown error.'}`
        );
    }
};

export { sendEmail };
