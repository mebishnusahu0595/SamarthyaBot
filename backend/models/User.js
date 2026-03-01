const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    language: { type: String, enum: ['hindi', 'hinglish', 'english'], default: 'hinglish' },
    city: { type: String, default: '' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    workType: { type: String, enum: ['student', 'business', 'developer', 'personal', 'other'], default: 'personal' },
    activePack: { type: String, enum: ['student', 'business', 'developer', 'personal'], default: 'personal' },
    permissions: {
        fileAccess: { type: String, enum: ['allow_once', 'allow_always', 'never', 'ask'], default: 'ask' },
        emailAccess: { type: String, enum: ['allow_once', 'allow_always', 'never', 'ask'], default: 'ask' },
        browserAccess: { type: String, enum: ['allow_once', 'allow_always', 'never', 'ask'], default: 'ask' },
        calendarAccess: { type: String, enum: ['allow_once', 'allow_always', 'never', 'ask'], default: 'ask' },
    },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '', index: true },
    source: { type: String, enum: ['web', 'whatsapp', 'telegram'], default: 'web' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
