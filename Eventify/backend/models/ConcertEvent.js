const mongoose = require('mongoose');

const concertEventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    pricing: {
        gold: { type: Number, required: true },
        platinum: { type: Number, required: true },
        diamond: { type: Number, required: true },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    category: {
        type: String,
        default: 'Music',
        trim: true,
        index: true
    },
    tags: {
        type: [String],
        default: []
    },
    requiredSkills: {
        type: [String],
        default: []
    },
    eventDate: {
        type: Date,
        default: null
    },
    registrationDeadline: {
        type: Date,
        default: null
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    eligibility: {
        type: String,
        default: 'Open to all',
        trim: true
    },
    capacity: {
        type: Number,
        default: 500,
        min: 0
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming',
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ConcertEvent', concertEventSchema);
