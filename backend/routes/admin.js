const express = require("express");
const router = express.Router();
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authMiddleware, adminOnly } = require("../middleware/auth");

/**
 * Enable 2FA (ADMIN ONLY)
 */
router.post("/enable-2fa", authMiddleware, adminOnly, async (req, res) => {
  const secret = speakeasy.generateSecret({ length: 20 });

  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      twoFASecret: secret.base32,
      twoFAEnabled: true,
    },
  });

  const qr = await QRCode.toDataURL(secret.otpauth_url);

  res.json({
    qr,
    manualKey: secret.base32,
  });
});

module.exports = router;
