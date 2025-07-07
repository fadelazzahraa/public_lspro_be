const { User, Reviewer } = require('../models');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const UserFound = await User.findOne({ where: { email } });
        if (UserFound) {
            return res.status(400).json({ status: false, message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email: email,
            password_hash: hashedPassword,
            role: "reviewer"
        });

        res.status(201).json({
            status: true, message: 'User created successfully', data: {
                id: newUser.id,
                email: newUser.email,
                password_hash: '(hidden)',
                role: newUser.reviewer
            }
        });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] }
        });
        res.status(200).json({
            status: true,
            message: 'Users retrieved successfully',
            data: users
        });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const id = req.params.id;

        const user = await User.findByPk(id, {
            attributes: {
                exclude: ['password_hash'],
            },
            include: [
                {
                    model: Reviewer,
                    attributes: ['id', 'name', 'title', 'role', 'is_active']
                }
            ],
        });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        res.status(200).json({
            status: true,
            message: 'User retrieved successfully',
            data: user
        });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const id = req.user.id;
        const { old_password, new_password } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const isOldPasswordMatch = await bcrypt.compare(old_password, user.password_hash);
        if (!isOldPasswordMatch) {
            return res.status(401).json({ status: false, message: 'Old password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(new_password, 10);

        user.password_hash = hashedNewPassword;
        await user.save();

        res.status(200).json({ status: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
}

exports.changeEmail = async (req, res) => {
    try {
        const id = req.user.id;
        const { email } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        user.email = email;
        await user.save();

        res.status(200).json({ status: true, message: 'Email updated successfully' });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { email, password, role } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        user.email = email || user.email;
        user.password_hash = password ? await bcrypt.hash(password, 10) : user.password_hash;
        user.role = role || user.role;

        await user.save();
        res.status(200).json({
            status: true, message: 'User updated', data: {
                email: user.email,
                role: user.role,
                password: '(hidden, updated)',
            }
        });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        await user.destroy();
        res.status(200).json({ status: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};
