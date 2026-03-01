const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password, language, city, workType } = req.body;

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashed,
            language: language || 'hinglish',
            city: city || '',
            workType: workType || 'personal',
            activePack: workType || 'personal'
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                language: user.language,
                city: user.city,
                workType: user.workType,
                activePack: user.activePack,
                permissions: user.permissions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                language: user.language,
                city: user.city,
                workType: user.workType,
                activePack: user.activePack,
                permissions: user.permissions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, language, city, workType, activePack, permissions } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (language) updateData.language = language;
        if (city) updateData.city = city;
        if (workType) updateData.workType = workType;
        if (activePack) updateData.activePack = activePack;
        if (permissions) updateData.permissions = permissions;

        const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Quick Demo Login (No password needed - for development)
exports.demoLogin = async (req, res) => {
    try {
        let user = await User.findOne({ email: 'demo@samarthya.com' });

        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash('demo123', salt);
            user = await User.create({
                name: 'Demo User',
                email: 'demo@samarthya.com',
                password: hashed,
                language: 'hinglish',
                city: 'Mumbai',
                workType: 'personal',
                activePack: 'personal'
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                language: user.language,
                city: user.city,
                workType: user.workType,
                activePack: user.activePack,
                permissions: user.permissions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
