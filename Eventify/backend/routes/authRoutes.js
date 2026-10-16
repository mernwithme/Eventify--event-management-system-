const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const { sendOtpEmail } = require('../services/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Register User
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message || 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Generate secure 6-digit OTP
            const otp = crypto.randomInt(100000, 1000000).toString();
            const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

            user.loginOtp = otpHash;
            user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
            await user.save();

            // Send OTP email (or dev log)
            await sendOtpEmail(user.email, otp, user.name);

            return res.json({
                otpRequired: true,
                email: user.email,
                message: 'A 6-digit verification code has been sent to your email address.',
                devOtp: (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) ? otp : undefined
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Login failed' });
    }
});

// Verify Login OTP
router.post('/verify-login-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and verification code are required' });
        }

        const user = await User.findOne({ email });

        if (!user || !user.loginOtp || !user.loginOtpExpires) {
            return res.status(400).json({ message: 'No pending OTP verification found. Please log in again.' });
        }

        if (user.loginOtpExpires.getTime() < Date.now()) {
            user.loginOtp = null;
            user.loginOtpExpires = null;
            await user.save();
            return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
        }

        const inputHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
        if (inputHash !== user.loginOtp) {
            return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
        }

        // OTP verified successfully - clear OTP
        user.loginOtp = null;
        user.loginOtpExpires = null;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: error.message || 'Verification failed' });
    }
});

// Resend Login OTP
router.post('/resend-login-otp', async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Generate new 6-digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

        user.loginOtp = otpHash;
        user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
        await user.save();

        await sendOtpEmail(user.email, otp, user.name);

        res.json({
            success: true,
            message: 'A new verification code has been sent to your email.',
            devOtp: (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) ? otp : undefined
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: error.message || 'Failed to resend code' });
    }
});

// Normalization and validation helper
const normalizeStringArray = (arr, maxItems = 30, maxCharLength = 50) => {
    if (!Array.isArray(arr)) {
        throw new Error('Expected an array of strings');
    }
    const set = new Set();
    for (const raw of arr) {
        if (typeof raw !== 'string') {
            throw new Error('Each item in the list must be a string');
        }
        const trimmed = raw.trim().toLowerCase();
        if (trimmed.length > 0) {
            if (trimmed.length > maxCharLength) {
                throw new Error(`Item exceeds maximum length of ${maxCharLength} characters`);
            }
            set.add(trimmed);
        }
        if (set.size >= maxItems) break;
    }
    return Array.from(set);
};

// GET /api/auth/preferences - Get current authenticated user preferences
router.get('/preferences', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('preferences');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const defaultPreferences = {
            interests: [],
            skills: [],
            preferredCategories: [],
            preferredLocation: '',
            maxBudget: null,
            allowOnline: true
        };

        const preferences = {
            ...defaultPreferences,
            ...(user.preferences ? user.preferences.toObject() : {})
        };

        res.json({
            success: true,
            preferences
        });
    } catch (error) {
        console.error('Fetch preferences error:', error);
        res.status(500).json({ message: 'Failed to retrieve preferences' });
    }
});

// PATCH /api/auth/preferences - Update current authenticated user preferences
router.patch('/preferences', protect, async (req, res) => {
    try {
        const {
            interests,
            skills,
            preferredCategories,
            preferredLocation,
            maxBudget,
            allowOnline
        } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.preferences) {
            user.preferences = {};
        }

        // Validate and normalize interests
        if (interests !== undefined) {
            user.preferences.interests = normalizeStringArray(interests, 30, 50);
        }

        // Validate and normalize skills
        if (skills !== undefined) {
            user.preferences.skills = normalizeStringArray(skills, 30, 50);
        }

        // Validate and normalize preferredCategories
        if (preferredCategories !== undefined) {
            user.preferences.preferredCategories = normalizeStringArray(preferredCategories, 20, 50);
        }

        // Validate preferredLocation
        if (preferredLocation !== undefined) {
            if (typeof preferredLocation !== 'string') {
                return res.status(400).json({ message: 'preferredLocation must be a string' });
            }
            if (preferredLocation.length > 100) {
                return res.status(400).json({ message: 'preferredLocation must not exceed 100 characters' });
            }
            user.preferences.preferredLocation = preferredLocation.trim();
        }

        // Validate maxBudget
        if (maxBudget !== undefined) {
            if (maxBudget === null || maxBudget === '') {
                user.preferences.maxBudget = null;
            } else {
                const num = Number(maxBudget);
                if (isNaN(num) || num < 0 || num > 10000000) {
                    return res.status(400).json({ message: 'maxBudget must be a valid number between 0 and 10,000,000' });
                }
                user.preferences.maxBudget = num;
            }
        }

        // Validate allowOnline
        if (allowOnline !== undefined) {
            if (typeof allowOnline !== 'boolean') {
                return res.status(400).json({ message: 'allowOnline must be a boolean' });
            }
            user.preferences.allowOnline = allowOnline;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            preferences: user.preferences
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(400).json({ message: error.message || 'Failed to update preferences' });
    }
});

module.exports = router;
