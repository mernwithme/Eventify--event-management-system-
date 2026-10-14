const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

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
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
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
