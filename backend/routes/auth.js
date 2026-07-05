const express = require('express');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const withTimeout = (promise, ms = 5000) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Database timeout after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Generate temporary session token for 2FA verification
const generateTempToken = (id) => jwt.sign({ id, temp: true }, process.env.JWT_SECRET, { expiresIn: '5m' });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Debug logging
        console.log('📝 Register request:', { name, email, phone, hasPassword: !!password });

        if (!password || password.length < 8) {
            console.log('⚠️ Weak password provided for:', email);
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        console.time('register_findUnique');
        const exists = await withTimeout(User.findUnique({ where: { email } }));
        console.timeEnd('register_findUnique');
        if (exists) {
            console.log('⚠️ User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        console.time('register_createUser');
        const user = await withTimeout(User.create({
            data: { name, email, password: hashedPassword, phone }
        }));
        console.timeEnd('register_createUser');
        console.log('✅ User registered:', { id: user.id, email: user.email });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id)
        });
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password, token } = req.body;

  const user = await User.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  // 🔐 ADMIN + 2FA ONLY
  if (user.role === "ADMIN" && user.twoFAEnabled) {
    if (!token) {
      return res.status(206).json({ twoFARequired: true });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token,
    });

    if (!verified) {
      return res.status(401).json({ message: "Invalid 2FA code" });
    }
  }

  // ✅ LOGIN SUCCESS
  const jwtToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token: jwtToken, role: user.role });
});

// @POST /api/auth/verify-2fa
// Verify TOTP code and return JWT token
router.post('/verify-2fa', async (req, res) => {
    try {
        const { tempSessionToken, totpCode } = req.body;

        if (!tempSessionToken || !totpCode) {
            return res.status(400).json({ message: 'Temp token and TOTP code required' });
        }

        // Verify temp token
        let decoded;
        try {
            decoded = jwt.verify(tempSessionToken, process.env.JWT_SECRET);
            if (!decoded.temp) {
                return res.status(401).json({ message: 'Invalid temp token' });
            }
        } catch (err) {
            return res.status(401).json({ message: 'Temp token expired or invalid' });
        }

        const user = await User.findUnique({ where: { id: decoded.id } });
        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ message: 'Invalid 2FA state' });
        }

        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: totpCode,
            window: 1
        });

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid authenticator code' });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id)
        });
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

// @GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
    try {
        console.log("Executing Prisma query...");
        const user = await User.findUnique({ where: { id: req.user.id } });
        console.log("Database write successful");
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
    try {
        console.log("Executing Prisma query...");
        const user = await User.findUnique({ where: { id: req.user.id } });
        console.log("Database write successful");
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updateData = {
            name: req.body.name || user.name,
            phone: req.body.phone !== undefined ? req.body.phone : user.phone
        };
        if (req.body.password) {
            if (req.body.password.length < 8) {
                return res.status(400).json({ message: 'Password must be at least 8 characters long' });
            }
            updateData.password = await bcrypt.hash(req.body.password, 12);
        }

        console.log("Executing Prisma query...");
        const updated = await User.update({
            where: { id: req.user.id },
            data: updateData
        });
        console.log("Database write successful");

        res.json({
            id: updated.id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
            token: generateToken(updated.id)
        });
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

module.exports = router;
