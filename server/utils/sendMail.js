const nodemailer = require("nodemailer");

const sendMail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail", // or "Outlook", "Yahoo", etc.
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Xequity" <${process.env.EMAIL_USER}> `,
            to,
            subject,
            text,
        });

        return true;
    } catch (error) {
        console.error("Error sending mail:", error);
        return false;
    }
};

module.exports = sendMail;