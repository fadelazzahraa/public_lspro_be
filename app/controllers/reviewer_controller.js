const { Reviewer, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

exports.createReviewer = async (req, res) => {
    try {
        const { name, title, user_id } = req.body;

        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (ReviewerFound) {
            return res.status(400).json({ status: false, message: 'User is already a reviewer' });
        }

        const reviewer = await Reviewer.create({
            name,
            title,
            is_active: true,
            user_id
        });

        res.status(201).json({
            status: true,
            message: 'Reviewer created successfully',
            data: reviewer
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error creating reviewer' });
    }
};

exports.getAllReviewers = async (req, res) => {
    try {
        const reviewers = await Reviewer.findAll();
        res.status(200).json({
            status: true,
            message: 'Reviewers retrieved successfully',
            data: reviewers
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching reviewers' });
    }
};

exports.getReviewerById = async (req, res) => {
    try {
        const id = req.params.id;

        const reviewer = await Reviewer.findByPk(id);
        if (!reviewer) {
            return res.status(404).json({ status: false, message: 'Reviewer not found' });
        }

        res.status(200).json({
            status: true,
            message: 'Reviewer retrieved successfully',
            data: reviewer
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching reviewer' });
    }
};

exports.changeReviewerData = async (req, res) => {
    try {
        const id = req.user.id;
        const { name, title } = req.body;

        const reviewer = await Reviewer.findOne({ where: { userId: id } });
        if (!reviewer) {
            return res.status(404).json({ status: false, message: 'Reviewer not found' });
        }

        reviewer.name = name || reviewer.name;
        reviewer.title = title || reviewer.title;

        await reviewer.save();

        res.status(200).json({
            status: true,
            message: 'Reviewer data changed successfully',
            data: reviewer
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error updating reviewer' });
    }
};

exports.uploadSpeciments = async (req, res) => {
    try {
        const id = req.params.id

        if (!req.file) {
            return res.status(400).json({ status: false, message: 'No file uploaded or invalid file type' });
        }
        const tempPath = req.file.path;

        const reviewer = await Reviewer.findByPk(id);
        if (!reviewer) {
            return res.status(404).json({ status: false, message: 'Reviewer not found' });
        }

        if (reviewer.speciment_file_uuid !== null) {
            const oldPath = path.resolve(__dirname, './../uploads/speciment', reviewer.speciment_file_uuid);
            await fs.unlink(oldPath).catch(() => { });
        }

        const uuid = uuidv4();
        const ext = path.extname(req.file.originalname);

        const newFileName = `${uuid}${ext}`;
        const finalPath = path.resolve(__dirname, './../uploads/speciment', newFileName);

        try {
            await fs.move(tempPath, finalPath);

            reviewer.speciment_file_uuid = newFileName;

            await reviewer.save();

            return res.status(201).json({
                status: true,
                message: 'File uploaded and speciment saved successfully',
                data: reviewer,
            });
        } catch (err) {
            await fs.unlink(tempPath).catch(() => { });
            await fs.unlink(finalPath).catch(() => { });

            throw new Error('Error saving file: ', err)
        }
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error updating reviewer' });
    }
};

exports.updateReviewer = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, title, is_active, user_id } = req.body;

        const reviewer = await Reviewer.findByPk(id);
        if (!reviewer) {
            return res.status(404).json({ status: false, message: 'Reviewer not found' });
        }
        reviewer.name = name || reviewer.name;
        reviewer.title = title || reviewer.title;
        reviewer.is_active = is_active || reviewer.is_active;
        if (user_id && user_id !== id) {
            const user = await User.findByPk(user_id);
            if (!user) {
                return res.status(404).json({ status: false, message: 'User not found' });
            }
            const ReviewerFound = await Reviewer.findOne({ where: { userId: user_id } });
            if (ReviewerFound && ReviewerFound.id !== id) {
                return res.status(400).json({ status: false, message: 'User is already a reviewer' });
            }

            reviewer.userId = user_id;
        }

        await reviewer.save();
        res.status(200).json({
            status: true,
            message: 'Reviewer updated successfully',
            data: reviewer
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error updating reviewer' });
    }
};

exports.deleteReviewer = async (req, res) => {
    try {
        const id = req.params.id;
        const reviewer = await Reviewer.findByPk(id);
        if (!reviewer) {
            return res.status(404).json({ status: false, message: 'Reviewer not found' });
        }

        await reviewer.destroy();
        res.status(200).json({ status: false, message: 'Reviewer deleted' });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error deleting reviewer' });
    }
};
