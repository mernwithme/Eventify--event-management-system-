const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    loginOtp: {
        type: String,
        default: null
    },
    loginOtpExpires: {
        type: Date,
        default: null
    },
    preferences: {
        interests: {
            type: [String],
            default: []
        },
        skills: {
            type: [String],
            default: []
        },
        preferredCategories: {
            type: [String],
            default: []
        },
        preferredLocation: {
            type: String,
            default: '',
            trim: true
        },
        maxBudget: {
            type: Number,
            default: null
        },
        allowOnline: {
            type: Boolean,
            default: true
        }
    }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
