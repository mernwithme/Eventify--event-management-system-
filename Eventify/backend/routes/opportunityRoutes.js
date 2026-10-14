const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ConcertEvent = require('../models/ConcertEvent');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { scoreEventForUser, rankOpportunities } = require('../services/recommendationService');

/**
 * GET /api/opportunities/recommended
 * Retrieve personalized event recommendations for authenticated user
 */
router.get('/recommended', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('preferences name');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Parse and validate query filters
        const { category, maxBudget, isOnline, page = 1, limit = 12 } = req.query;

        const options = {
            category: typeof category === 'string' && category.trim() ? category.trim() : undefined,
            maxBudget: maxBudget && !isNaN(Number(maxBudget)) ? Number(maxBudget) : undefined,
            isOnline: isOnline !== undefined ? isOnline === 'true' : undefined,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 12
        };

        // Query only public, eligible concert events.
        // Private PersonalEvent records are strictly excluded from recommendations.
        const events = await ConcertEvent.find({
            status: { $ne: 'cancelled' }
        })
            .populate('user', 'name')
            .lean();

        const result = rankOpportunities(user, events, options);

        res.json({
            success: true,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            userPreferences: user.preferences || {},
            data: result.items
        });
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ message: 'Failed to generate recommendations' });
    }
});

/**
 * GET /api/opportunities/:eventId/explanation
 * Retrieve detailed transparent match explanation for a specific event
 */
router.get('/:eventId/explanation', protect, async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ message: 'Invalid event ID' });
        }

        const user = await User.findById(req.user._id).select('preferences name');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const event = await ConcertEvent.findById(eventId)
            .populate('user', 'name')
            .lean();

        if (!event) {
            return res.status(404).json({ message: 'Event not found or unavailable' });
        }

        const explanation = scoreEventForUser(user.preferences || {}, event);

        res.json({
            success: true,
            eventId: event._id,
            eventName: event.name,
            matchScore: explanation.matchScore,
            isEligible: explanation.isEligible,
            scoreBreakdown: explanation.scoreBreakdown,
            reasons: explanation.reasons,
            matchedInterests: explanation.matchedInterests,
            matchedSkills: explanation.matchedSkills,
            budgetCompatibility: explanation.budgetCompatibility,
            registrationStatus: explanation.registrationStatus
        });
    } catch (error) {
        console.error('Error generating explanation:', error);
        res.status(500).json({ message: 'Failed to retrieve match explanation' });
    }
});

module.exports = router;
