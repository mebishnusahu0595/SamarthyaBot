const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Local OS Mode: Bypass JWT Authentication 
        // We automatically find or create a default "Local Admin" user.
        let user = await User.findOne({ email: 'admin@samarthya.local' });

        if (!user) {
            user = new User({
                name: 'System Admin',
                email: 'admin@samarthya.local',
                password: 'no_password_needed_for_local',
                role: 'admin',
                activePack: 'developer'
            });
            await user.save();
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(500).json({ success: false, message: 'Local Auth Error', error: error.message });
    }
};

module.exports = auth;
