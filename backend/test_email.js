const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mebishnusahu0595@gmail.com',
        pass: 'srdhoxxykgitcrph'
    }
});

const mailOptions = {
    from: 'mebishnusahu0595@gmail.com',
    to: 'datascienceforus05@gmail.com',
    subject: 'Direct SMTP Test',
    text: 'If you see this, the terminal nodemailer is successful.'
};

async function send() {
    try {
        console.log("Attempting to send...");
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Success! ID: " + info.messageId);
    } catch (err) {
        console.error("❌ Failed!");
        console.error(err);
    }
}

send();
