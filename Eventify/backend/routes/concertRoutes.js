const express = require('express');
const router = express.Router();
const ConcertEvent = require('../models/ConcertEvent');
const { protect } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
    try {
        const concerts = await ConcertEvent.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(concerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Helper to clean array of strings
const cleanStringArray = (arr, maxItems = 20, maxCharLength = 50) => {
    if (!Array.isArray(arr)) return [];
    const set = new Set();
    for (const raw of arr) {
        if (typeof raw === 'string') {
            const trimmed = raw.trim().toLowerCase();
            if (trimmed.length > 0 && trimmed.length <= maxCharLength) {
                set.add(trimmed);
            }
        }
        if (set.size >= maxItems) break;
    }
    return Array.from(set);
};

router.post('/', protect, async (req, res) => {
    const {
        name,
        location,
        description,
        pricing,
        category,
        tags,
        requiredSkills,
        eventDate,
        registrationDeadline,
        isOnline,
        eligibility,
        capacity,
        status
    } = req.body;

    try {
        if (!name || !location || !description || !pricing) {
            return res.status(400).json({ message: 'Name, location, description, and pricing are required' });
        }

        const concert = new ConcertEvent({
            name: name.trim(),
            location: location.trim(),
            description: description.trim(),
            pricing,
            user: req.user._id,
            category: typeof category === 'string' && category.trim() ? category.trim() : 'Music',
            tags: cleanStringArray(tags),
            requiredSkills: cleanStringArray(requiredSkills),
            eventDate: eventDate ? new Date(eventDate) : null,
            registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
            isOnline: Boolean(isOnline),
            eligibility: typeof eligibility === 'string' && eligibility.trim() ? eligibility.trim() : 'Open to all',
            capacity: Number.isInteger(Number(capacity)) && Number(capacity) >= 0 ? Number(capacity) : 500,
            status: ['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status) ? status : 'upcoming'
        });

        const createdConcert = await concert.save();
        const populatedConcert = await ConcertEvent.findById(createdConcert._id).populate('user', 'name email');
        res.status(201).json(populatedConcert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', protect, async (req, res) => {
    const {
        name,
        location,
        description,
        pricing,
        category,
        tags,
        requiredSkills,
        eventDate,
        registrationDeadline,
        isOnline,
        eligibility,
        capacity,
        status
    } = req.body;

    try {
        const concert = await ConcertEvent.findById(req.params.id);

        if (!concert) {
            return res.status(404).json({ message: 'Concert event not found' });
        }

        if (concert.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        if (name !== undefined) concert.name = name;
        if (location !== undefined) concert.location = location;
        if (description !== undefined) concert.description = description;
        if (pricing !== undefined) concert.pricing = pricing;
        if (category !== undefined) concert.category = category.trim();
        if (tags !== undefined) concert.tags = cleanStringArray(tags);
        if (requiredSkills !== undefined) concert.requiredSkills = cleanStringArray(requiredSkills);
        if (eventDate !== undefined) concert.eventDate = eventDate ? new Date(eventDate) : null;
        if (registrationDeadline !== undefined) concert.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null;
        if (isOnline !== undefined) concert.isOnline = Boolean(isOnline);
        if (eligibility !== undefined) concert.eligibility = eligibility.trim();
        if (capacity !== undefined) concert.capacity = Number(capacity);
        if (status !== undefined && ['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
            concert.status = status;
        }

        const updatedConcert = await concert.save();
        const populatedConcert = await ConcertEvent.findById(updatedConcert._id).populate('user', 'name email');
        res.json(populatedConcert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const concert = await ConcertEvent.findById(req.params.id);

        if (!concert) {
            return res.status(404).json({ message: 'Concert event not found' });
        }

        if (concert.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await ConcertEvent.deleteOne({ _id: req.params.id });
        res.json({ message: 'Concert event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
