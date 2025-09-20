// server\config\emailConfig.js
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Add these settings to improve deliverability
    tls: {
        rejectUnauthorized: false
    }
});

const sendOTP = async (email, otp) => {
    try {
        // Read the logo file
        const logoPath = path.join(__dirname, '../../frontend/src/assets/complete_logo.png');

        // Add error handling for file reading
        if (!fs.existsSync(logoPath)) {
            console.error('Logo file not found at:', logoPath);
            throw new Error('Logo file not found');
        }
        // Read the logo file and convert it to base64
        const logoBase64 = fs.readFileSync(logoPath).toString('base64');


        await transporter.sendMail({
            from: {
                name: 'Xequity',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Email Verification - Xequity',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <img src="cid:companyLogo" alt="Xequity" style="max-width: 200px; margin-bottom: 20px;"/>
                    <h2 style="color: #1877f2; margin-bottom: 20px;">Verify Your Email</h2>
                    <p style="color: #333; font-size: 16px;">Welcome to Xequity! Please use the following verification code:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
                        <h1 style="color: #1877f2; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
                    </div>
                    <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #888; font-size: 12px;">If you didn't request this verification, please ignore this email.</p>
                </div>
            `,
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high'
            },
            attachments: [{
                filename: 'complete_logo.png',
                content: logoBase64,
                encoding: 'base64',
                cid: 'companyLogo'
            }]
        });
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

module.exports = { sendOTP };