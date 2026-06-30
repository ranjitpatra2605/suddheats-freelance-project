const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const prisma = require('../models/db');
const router = express.Router();

// POST /api/contact — send customer message to admin email and save to DB
router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Save to Database
        await prisma.contactQuery.create({
            data: {
                name,
                email,
                subject,
                message
            }
        });
        console.log('[Contact] Query saved to database successfully');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        const now = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'long',
            timeStyle: 'short'
        });

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f0; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #475d2a; padding: 28px 32px; text-align: center; }
    .header img { width: 48px; height: 48px; margin-bottom: 8px; }
    .header h1 { color: #ffffff; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: 0.5px; }
    .header p { color: rgba(255,255,255,0.7); font-size: 13px; margin: 4px 0 0; }
    .badge { display: inline-block; background: rgb(223,196,172); color: #475d2a; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-top: 10px; letter-spacing: 0.5px; text-transform: uppercase; }
    .body { padding: 32px; }
    .label { font-size: 11px; font-weight: 700; color: #475d2a; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
    .value { font-size: 15px; color: #1a1a1a; margin: 0 0 20px; padding: 12px 16px; background: #f5f7f2; border-left: 3px solid #475d2a; border-radius: 0 8px 8px 0; }
    .message-value { white-space: pre-wrap; }
    .footer { background: #f0f4ed; padding: 20px 32px; text-align: center; border-top: 1px solid #e5ebe0; }
    .footer p { color: #888; font-size: 12px; margin: 0; }
    .footer .brand { color: #475d2a; font-weight: 700; }
    .divider { height: 1px; background: #eee; margin: 8px 0 24px; }
    .meta { color: #999; font-size: 12px; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="cid:shuddheats_logo" alt="ShuddhEats" style="width:180px; height:auto; margin-bottom:10px; display:block; margin-left:auto; margin-right:auto;" />
      <p>New Customer Message</p>
      <div class="badge">Contact Form Submission</div>
    </div>
    <div class="body">
      <p style="color:#555; font-size:14px; margin-bottom:24px;">
        You have received a new message from the ShuddhEats contact form. Please review and respond within 24 hours.
      </p>

      <div class="divider"></div>

      <div class="label">Customer Name</div>
      <div class="value">${name}</div>

      <div class="label">Email Address</div>
      <div class="value"><a href="mailto:${email}" style="color:#475d2a; text-decoration:none;">${email}</a></div>

      <div class="label">Subject</div>
      <div class="value">${subject}</div>

      <div class="label">Message</div>
      <div class="value message-value">${message}</div>

      <div class="label">Received On</div>
      <div class="value">${now}</div>
    </div>
    <div class="footer">
      <p>This message was sent via the contact form on <span class="brand">ShuddhEats.co.in</span></p>
      <p style="margin-top: 6px;">To reply, simply respond to: <a href="mailto:${email}" style="color:#475d2a;">${email}</a></p>
    </div>
  </div>
</body>
</html>`;

        await transporter.sendMail({
            from: `"ShuddhEats Contact Form" <${process.env.GMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL || 'info@shuddheats.co.in',
            replyTo: email,
            subject: `[ShuddhEats Inquiry] ${subject}`,
            html: htmlContent,
            text: `New message from ${name} (${email})\n\nSubject: ${subject}\n\nMessage:\n${message}\n\nReceived: ${now}`,
            attachments: [{
                filename: 'logo.png',
                path: path.join(__dirname, '../assets/logo.png'),
                cid: 'shuddheats_logo',
                contentDisposition: 'inline'
            }]
        });
        
        console.log('[Contact] Email sent successfully');
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        console.error('[Contact] Error processing contact query:', err.message);
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
});

module.exports = router;
