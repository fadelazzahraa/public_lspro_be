const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

module.exports = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer token"
    if (!token) return res.status(401).json({ status: false, message: 'Token required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(401).json({ status: false, message: 'Invalid token' });

        req.user = user; // inject user ke request
        next();
    } catch (err) {
        res.status(401).json({ status: false, message: 'Invalid token' });
    }
};

