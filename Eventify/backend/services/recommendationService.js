/**
 * Eventify Opportunity Intelligence Recommendation Service
 * Transparent, weighted multi-factor scoring algorithm (0-100)
 */

/**
 * Calculate match score and human-readable explanations between a user profile and an event.
 * @param {Object} userPreferences - Authenticated user's preferences
 * @param {Object} event - Event document (e.g., ConcertEvent)
 * @returns {Object} Score breakdown, total score (0-100), reasons, and eligibility
 */
function scoreEventForUser(userPreferences = {}, event = {}) {
    const preferences = {
        interests: Array.isArray(userPreferences.interests) ? userPreferences.interests.map(i => String(i).toLowerCase()) : [],
        skills: Array.isArray(userPreferences.skills) ? userPreferences.skills.map(s => String(s).toLowerCase()) : [],
        preferredCategories: Array.isArray(userPreferences.preferredCategories) ? userPreferences.preferredCategories.map(c => String(c).toLowerCase()) : [],
        preferredLocation: userPreferences.preferredLocation ? String(userPreferences.preferredLocation).trim().toLowerCase() : '',
        maxBudget: (typeof userPreferences.maxBudget === 'number' && !isNaN(userPreferences.maxBudget)) ? userPreferences.maxBudget : null,
        allowOnline: typeof userPreferences.allowOnline === 'boolean' ? userPreferences.allowOnline : true
    };

    const reasons = [];
    const matchedInterests = [];
    const matchedSkills = [];

    // Check validity/availability
    const now = new Date();
    const isCancelled = event.status === 'cancelled';
    const isCompleted = event.status === 'completed';
    const isPastDate = event.eventDate && new Date(event.eventDate).getTime() < (now.getTime() - 24 * 60 * 60 * 1000);
    const isDeadlinePassed = event.registrationDeadline && new Date(event.registrationDeadline).getTime() < now.getTime();

    if (isCancelled || isCompleted || isPastDate || isDeadlinePassed) {
        return {
            isEligible: false,
            matchScore: 0,
            reasons: [
                isCancelled ? 'Event has been cancelled' :
                isCompleted ? 'Event has concluded' :
                isPastDate ? 'Event date has passed' :
                'Registration deadline has closed'
            ],
            matchedInterests: [],
            matchedSkills: [],
            budgetCompatibility: { isAffordable: false, minPrice: null, maxBudget: preferences.maxBudget },
            registrationStatus: 'Closed'
        };
    }

    // 1. Category Matching (Weight: 25)
    let categoryScore = 0;
    const eventCategory = (event.category || 'Music').toLowerCase();
    if (preferences.preferredCategories.length > 0) {
        if (preferences.preferredCategories.includes(eventCategory)) {
            categoryScore = 25;
            reasons.push(`Direct match with your preferred category (${event.category})`);
        } else {
            categoryScore = 5; // Minimal baseline for discovery
        }
    } else {
        categoryScore = 15; // Neutral baseline when user has no set categories
    }

    // 2. Interest & Tag Overlap (Weight: 25)
    let interestScore = 0;
    const eventTags = Array.isArray(event.tags) ? event.tags.map(t => String(t).toLowerCase()) : [];
    const eventNameWords = String(event.name || '').toLowerCase().split(/\s+/);
    const eventDescWords = String(event.description || '').toLowerCase().split(/\s+/);

    if (preferences.interests.length > 0) {
        for (const interest of preferences.interests) {
            const inTags = eventTags.includes(interest);
            const inName = eventNameWords.includes(interest);
            const inDesc = eventDescWords.includes(interest);

            if (inTags || inName || inDesc) {
                matchedInterests.push(interest);
            }
        }

        if (matchedInterests.length > 0) {
            const matchRatio = Math.min(1, matchedInterests.length / Math.min(preferences.interests.length, 3));
            interestScore = Math.round(matchRatio * 25);
            reasons.push(`Matched ${matchedInterests.length} of your interests: ${matchedInterests.slice(0, 3).join(', ')}`);
        } else {
            interestScore = 2; // Minimal discovery baseline
        }
    } else {
        interestScore = 12; // Neutral baseline when no interests are specified
    }

    // 3. Skills Alignment (Weight: 20)
    let skillScore = 0;
    const eventSkills = Array.isArray(event.requiredSkills) ? event.requiredSkills.map(s => String(s).toLowerCase()) : [];

    if (eventSkills.length > 0) {
        if (preferences.skills.length > 0) {
            for (const skill of preferences.skills) {
                if (eventSkills.includes(skill)) {
                    matchedSkills.push(skill);
                }
            }

            if (matchedSkills.length > 0) {
                const skillRatio = Math.min(1, matchedSkills.length / Math.min(eventSkills.length, 2));
                skillScore = Math.round(skillRatio * 20);
                reasons.push(`Aligns with your skills: ${matchedSkills.slice(0, 2).join(', ')}`);
            } else {
                skillScore = 5;
            }
        } else {
            skillScore = 5;
        }
    } else {
        // Open to all skill levels
        skillScore = 15;
        if (preferences.skills.length > 0) {
            reasons.push('Open to all skill levels with no prerequisites required');
        }
    }

    // 4. Location & Format Relevance (Weight: 15)
    let locationScore = 0;
    const isOnline = Boolean(event.isOnline);
    const eventLocation = String(event.location || '').toLowerCase();

    if (isOnline) {
        if (preferences.allowOnline) {
            locationScore = 15;
            reasons.push('Online virtual event matches your flexible format preferences');
        } else {
            locationScore = 0;
        }
    } else {
        if (preferences.preferredLocation) {
            if (eventLocation.includes(preferences.preferredLocation) || preferences.preferredLocation.includes(eventLocation)) {
                locationScore = 15;
                reasons.push(`Located in or near your preferred location (${event.location})`);
            } else {
                locationScore = 5; // Different city
            }
        } else {
            locationScore = 10; // Neutral baseline
        }
    }

    // 5. Budget Affordability (Weight: 15)
    let budgetScore = 0;
    let minPrice = null;

    if (event.pricing && typeof event.pricing === 'object') {
        const prices = [event.pricing.gold, event.pricing.platinum, event.pricing.diamond]
            .map(p => Number(p))
            .filter(p => !isNaN(p) && p >= 0);
        if (prices.length > 0) {
            minPrice = Math.min(...prices);
        }
    }

    let isAffordable = true;
    let budgetNote = 'Fits within your budget';

    if (preferences.maxBudget !== null && minPrice !== null) {
        if (minPrice <= preferences.maxBudget) {
            budgetScore = 15;
            isAffordable = true;
            reasons.push(`Affordable starting tier at ₹${minPrice} (under your ₹${preferences.maxBudget} budget)`);
        } else if (minPrice <= preferences.maxBudget * 1.25) {
            budgetScore = 7;
            isAffordable = false;
            budgetNote = `Slightly above preferred budget (₹${minPrice} vs ₹${preferences.maxBudget})`;
        } else {
            budgetScore = 0;
            isAffordable = false;
            budgetNote = `Exceeds preferred budget (₹${minPrice} vs ₹${preferences.maxBudget})`;
        }
    } else {
        budgetScore = 15;
        budgetNote = minPrice !== null ? `Starting from ₹${minPrice}` : 'Pricing details available on event page';
    }

    // Total score normalized 0 to 100
    const rawTotal = categoryScore + interestScore + skillScore + locationScore + budgetScore;
    const matchScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

    if (reasons.length === 0) {
        reasons.push('General recommendation based on popular upcoming activities');
    }

    return {
        isEligible: true,
        matchScore,
        scoreBreakdown: {
            category: categoryScore,
            interests: interestScore,
            skills: skillScore,
            location: locationScore,
            budget: budgetScore
        },
        reasons,
        matchedInterests,
        matchedSkills,
        budgetCompatibility: {
            isAffordable,
            minPrice,
            maxBudget: preferences.maxBudget,
            notes: budgetNote
        },
        registrationStatus: 'Open'
    };
}

/**
 * Filter, score, and rank opportunities deterministically for an authenticated user.
 * @param {Object} user - User document containing preferences
 * @param {Array} events - List of ConcertEvent documents
 * @param {Object} options - Filtering and pagination options
 * @returns {Array} Scored, ranked recommendations
 */
function rankOpportunities(user, events = [], options = {}) {
    const preferences = (user && user.preferences) ? user.preferences : {};
    const { category, maxBudget, isOnline, limit = 20, page = 1 } = options;

    const scoredList = [];

    for (const event of events) {
        // Optional client filter: category
        if (category && event.category && event.category.toLowerCase() !== category.toLowerCase()) {
            continue;
        }

        // Optional client filter: isOnline
        if (typeof isOnline === 'boolean' && Boolean(event.isOnline) !== isOnline) {
            continue;
        }

        const scoring = scoreEventForUser(preferences, event);

        // Exclude ineligible (cancelled, past deadline, completed)
        if (!scoring.isEligible) {
            continue;
        }

        // Optional client filter: maxBudget
        if (typeof maxBudget === 'number' && scoring.budgetCompatibility.minPrice !== null) {
            if (scoring.budgetCompatibility.minPrice > maxBudget) {
                continue;
            }
        }

        scoredList.push({
            event,
            matchScore: scoring.matchScore,
            scoreBreakdown: scoring.scoreBreakdown,
            reasons: scoring.reasons,
            matchedInterests: scoring.matchedInterests,
            matchedSkills: scoring.matchedSkills,
            budgetCompatibility: scoring.budgetCompatibility,
            registrationStatus: scoring.registrationStatus,
            detailsUrl: `/concert-events`
        });
    }

    // Deterministic stable sorting:
    // 1. Highest match score first
    // 2. Tiebreaker: Most recent createdAt
    // 3. Tiebreaker: Lexicographical _id
    scoredList.sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
        }
        const dateA = a.event.createdAt ? new Date(a.event.createdAt).getTime() : 0;
        const dateB = b.event.createdAt ? new Date(b.event.createdAt).getTime() : 0;
        if (dateB !== dateA) {
            return dateB - dateA;
        }
        return String(a.event._id).localeCompare(String(b.event._id));
    });

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 20));
    const totalCount = scoredList.length;
    const startIndex = (parsedPage - 1) * parsedLimit;
    const paginatedItems = scoredList.slice(startIndex, startIndex + parsedLimit);

    return {
        total: totalCount,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalCount / parsedLimit) || 1,
        items: paginatedItems
    };
}

module.exports = {
    scoreEventForUser,
    rankOpportunities
};
