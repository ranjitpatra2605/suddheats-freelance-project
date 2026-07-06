const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

/**
 * ADMIN 2FA SETUP
 * POST /api/admin/2fa/setup
 */
router.post('/2fa/setup', adminOnly, async (req, res) => {
  try {
    const adminId = req.user.id;

    // Generate secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `Shuddheats-ADMIN (${req.user.email})`
    });

    // 🔑 THIS IS THE KEY YOU WANT
    console.log("==========================================");
    console.log(`ADMIN 2FA SECRET (SAVE THIS): ${secret.base32}`);
    console.log("==========================================");

    // Save Base32 secret in DB
    await prisma.user.update({
      where: { id: adminId },
      data: {
        twoFASecret: secret.base32,
        is2FAEnabled: true
      }
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      qrCode
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '2FA setup failed' });
  }
});

module.exports = router;
