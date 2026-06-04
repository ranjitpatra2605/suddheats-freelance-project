const express = require('express');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Generate temporary session token for 2FA verification
const generateTempToken = (id) => jwt.sign({ id, temp: true }, process.env.JWT_SECRET, { expiresIn: '5m' });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Debug logging
        console.log('📝 Register request:', { name, email, phone, hasPassword: !!password });

        const exists = await User.findUnique({ where: { email } });
        if (exists) {
            console.log('⚠️ User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            data: { name, email, password: hashedPassword, phone }
        });
        console.log('✅ User registered:', { _id: user._id, email: user.email });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (err) {
        console.error('❌ Register error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Debug logging
        console.log('🔐 Login attempt:', { email, hasPassword: !!password, bodyKeys: Object.keys(req.body) });

        const user = await User.findUnique({ where: { email } });
        if (!user) {
            console.log('⚠️ User not found:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log('⚠️ Password mismatch for:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('✅ Login successful:', { _id: user._id, email: user.email, role: user.role });

        // Check if admin with 2FA enabled
        if (user.role === 'admin' && user.twoFactorEnabled) {
            const tempToken = generateTempToken(user._id);
            console.log('🔑 2FA required for:', email);
            return res.json({
                requiresTwoFA: true,
                tempSessionToken: tempToken,
                message: 'Enter your authenticator code'
            });
        }

        // Normal login (user or admin without 2FA)
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (err) {
        console.error('❌ Login error:', err.message);
        res.status(500).json({ message: err.message });
    }
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

        // Get user
        const user = await User.findUnique({ where: { _id: decoded.id } });
        if (!user || !user.twoFactorEnabled) {
            return res.status(401).json({ message: 'Invalid 2FA setup' });
        }

        // Check if it's a backup code
        const backupCodesArray = Array.isArray(user.backupCodes) ? user.backupCodes : [];
        const backupCodeIndex = backupCodesArray.indexOf(totpCode.toUpperCase());
        if (backupCodeIndex !== -1) {
            // Valid backup code, remove it (single use)
            backupCodesArray.splice(backupCodeIndex, 1);
            const updatedUser = await User.update({
                where: { _id: user._id },
                data: { backupCodes: backupCodesArray }
            });
            return res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
                message: 'Login successful with backup code'
            });
        }

        // Verify TOTP code
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: totpCode,
            window: 2
        });

        if (!verified) {
            return res.status(401).json({ message: 'Invalid authenticator code' });
        }

        // Return JWT token
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findUnique({ where: { _id: req.user._id } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findUnique({ where: { _id: req.user._id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updateData = {
            name: req.body.name || user.name,
            phone: req.body.phone !== undefined ? req.body.phone : user.phone
        };
        if (req.body.password) {
            updateData.password = await bcrypt.hash(req.body.password, 12);
        }

        const updated = await User.update({
            where: { _id: req.user._id },
            data: updateData
        });

        res.json({
            _id: updated._id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
            token: generateToken(updated._id)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
