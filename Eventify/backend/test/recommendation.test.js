const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { scoreEventForUser, rankOpportunities } = require('../services/recommendationService');

describe('Opportunity Intelligence Recommendation Engine', () => {

    // 1. Backward Compatibility with existing event documents
    it('should gracefully handle existing legacy event documents without metadata', () => {
        const legacyEvent = {
            _id: 'legacy-1',
            name: 'Classic Rock Night',
            location: 'Bangalore',
            description: 'Live rock band performance',
            pricing: { gold: 500, platinum: 1000, diamond: 1500 }
        };

        const userPreferences = {
            interests: ['rock'],
            preferredCategories: ['music'],
            preferredLocation: 'Bangalore',
            maxBudget: 600,
            allowOnline: false
        };

        const result = scoreEventForUser(userPreferences, legacyEvent);
        assert.equal(result.isEligible, true);
        assert.ok(result.matchScore > 50, 'Expected positive match score for matching legacy event');
        assert.ok(result.reasons.length > 0);
        assert.equal(result.budgetCompatibility.isAffordable, true);
    });

    // 2. Exact category and tag matches
    it('should award high scores for exact category and tag matches', () => {
        const event = {
            _id: 'evt-1',
            name: 'React & AI Summit 2026',
            category: 'Technology',
            tags: ['react', 'ai', 'fullstack'],
            requiredSkills: ['javascript'],
            location: 'Online',
            isOnline: true,
            pricing: { gold: 200, platinum: 400, diamond: 800 },
            status: 'upcoming'
        };

        const userPreferences = {
            interests: ['react', 'ai'],
            skills: ['javascript'],
            preferredCategories: ['Technology'],
            allowOnline: true,
            maxBudget: 500
        };

        const result = scoreEventForUser(userPreferences, event);
        assert.equal(result.isEligible, true);
        assert.ok(result.matchScore >= 85, `Expected score >= 85, got ${result.matchScore}`);
        assert.ok(result.matchedInterests.includes('react'));
        assert.ok(result.matchedInterests.includes('ai'));
        assert.ok(result.matchedSkills.includes('javascript'));
    });

    // 3. Partial interest matches
    it('should calculate proportional scores for partial interest matches', () => {
        const event = {
            _id: 'evt-2',
            name: 'Jazz in the Park',
            category: 'Music',
            tags: ['jazz', 'instrumental'],
            pricing: { gold: 300, platinum: 600, diamond: 1000 },
            status: 'upcoming'
        };

        const userPreferences = {
            interests: ['jazz', 'rock', 'hiphop', 'classical'],
            preferredCategories: ['Music']
        };

        const result = scoreEventForUser(userPreferences, event);
        assert.equal(result.isEligible, true);
        assert.ok(result.matchedInterests.includes('jazz'));
        assert.equal(result.matchedInterests.length, 1);
    });

    // 4. Budget compatibility
    it('should score budget compatibility accurately', () => {
        const affordableEvent = {
            _id: 'evt-cheap',
            name: 'Budget Meetup',
            pricing: { gold: 150, platinum: 300, diamond: 500 },
            status: 'upcoming'
        };

        const expensiveEvent = {
            _id: 'evt-exp',
            name: 'VIP Gala',
            pricing: { gold: 5000, platinum: 10000, diamond: 20000 },
            status: 'upcoming'
        };

        const userPreferences = { maxBudget: 500 };

        const affordableScore = scoreEventForUser(userPreferences, affordableEvent);
        const expensiveScore = scoreEventForUser(userPreferences, expensiveEvent);

        assert.equal(affordableScore.budgetCompatibility.isAffordable, true);
        assert.equal(expensiveScore.budgetCompatibility.isAffordable, false);
        assert.ok(affordableScore.scoreBreakdown.budget > expensiveScore.scoreBreakdown.budget);
    });

    // 5. Location and format relevance
    it('should handle online vs in-person format preferences', () => {
        const onlineEvent = {
            _id: 'evt-webinar',
            name: 'Virtual Web Dev Workshop',
            isOnline: true,
            status: 'upcoming'
        };

        const inPersonEvent = {
            _id: 'evt-local',
            name: 'Local Tech Mixer',
            location: 'Mumbai',
            isOnline: false,
            status: 'upcoming'
        };

        const onlineUser = { allowOnline: true, preferredLocation: 'Delhi' };
        const inPersonUser = { allowOnline: false, preferredLocation: 'Mumbai' };

        const res1 = scoreEventForUser(onlineUser, onlineEvent);
        const res2 = scoreEventForUser(inPersonUser, onlineEvent);
        const res3 = scoreEventForUser(inPersonUser, inPersonEvent);

        assert.equal(res1.scoreBreakdown.location, 15);
        assert.equal(res2.scoreBreakdown.location, 0); // User rejected online events
        assert.equal(res3.scoreBreakdown.location, 15); // In-person match in Mumbai
    });

    // 6. Missing user preferences fallback
    it('should provide neutral baseline scoring when user preferences are empty', () => {
        const event = {
            _id: 'evt-general',
            name: 'City Art Exhibition',
            category: 'Art',
            location: 'Downtown Gallery',
            pricing: { gold: 200, platinum: 400, diamond: 600 },
            status: 'upcoming'
        };

        const emptyPreferences = {};
        const result = scoreEventForUser(emptyPreferences, event);

        assert.equal(result.isEligible, true);
        assert.ok(result.matchScore >= 40 && result.matchScore <= 80, `Expected baseline between 40-80, got ${result.matchScore}`);
    });

    // 7. Expired, cancelled, or past events exclusion
    it('should flag cancelled or expired events as ineligible', () => {
        const cancelledEvent = {
            _id: 'evt-cancel',
            name: 'Cancelled Rock Show',
            status: 'cancelled'
        };

        const pastEvent = {
            _id: 'evt-past',
            name: 'Past Concert 2020',
            eventDate: new Date('2020-01-01'),
            status: 'upcoming'
        };

        const resCancel = scoreEventForUser({}, cancelledEvent);
        const resPast = scoreEventForUser({}, pastEvent);

        assert.equal(resCancel.isEligible, false);
        assert.equal(resCancel.matchScore, 0);
        assert.equal(resPast.isEligible, false);
        assert.equal(resPast.matchScore, 0);
    });

    // 8. Deterministic ranking and stable tie-breaking
    it('should sort opportunities deterministically with stable tiebreakers', () => {
        const events = [
            {
                _id: 'b-event',
                name: 'High Match Event',
                category: 'Music',
                tags: ['rock'],
                createdAt: new Date('2026-01-01'),
                status: 'upcoming'
            },
            {
                _id: 'a-event',
                name: 'Low Match Event',
                category: 'Cooking',
                tags: ['baking'],
                createdAt: new Date('2026-01-02'),
                status: 'upcoming'
            },
            {
                _id: 'c-event',
                name: 'Tie Match Event 1',
                category: 'Music',
                tags: ['rock'],
                createdAt: new Date('2026-01-03'),
                status: 'upcoming'
            }
        ];

        const user = {
            preferences: {
                preferredCategories: ['Music'],
                interests: ['rock']
            }
        };

        const result = rankOpportunities(user, events);
        assert.equal(result.total, 3);
        assert.ok(result.items[0].matchScore >= result.items[1].matchScore);
        assert.ok(result.items[1].matchScore >= result.items[2].matchScore);

        // Tiebreaker between b-event and c-event (same score, c-event is newer):
        assert.equal(result.items[0].event._id, 'c-event');
        assert.equal(result.items[1].event._id, 'b-event');
    });

    // 9. Empty collections handling
    it('should gracefully handle empty event collections', () => {
        const result = rankOpportunities({ preferences: {} }, []);
        assert.equal(result.total, 0);
        assert.equal(result.items.length, 0);
        assert.equal(result.totalPages, 1);
    });
});
