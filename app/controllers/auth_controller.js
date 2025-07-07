const { User, Reviewer } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            where: { email },
            include: [
                {
                    model: Reviewer,
                    attributes: ['id', 'name', 'title', 'role', 'is_active']
                }
            ]
        });
        if (!user) return res.status(401).json({ status: false, message: 'Email or password is incorrect' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ status: false, message: 'Email or password is incorrect' });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            status: true,
            message: 'Logged in successfully',
            data: { id: user.id, email: user.email, role: user.role, reviewer: user.reviewer },
            token: token,
        });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};
