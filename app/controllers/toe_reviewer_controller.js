const { TOEReviewer, Reviewer, TOE } = require('../models');

exports.createTOEReviewer = async (req, res) => {
    try {
        const { reviewer_id, toe_id, is_lead_reviewer } = req.body;

        const ReviewerFound = await Reviewer.findByPk(reviewer_id);
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Reviewer not found' });
        }

        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Reviewer is not active' });
        }

        const TOEFound = await TOE.findByPk(toe_id);
        if (!TOEFound) {
            return res.status(404).json({ status: false, message: 'TOE not found' });
        }

        const TOEReviewerFound = await TOEReviewer.findOne({
            where: { reviewer_id, toe_id }
        });

        if (TOEReviewerFound) {
            return res.status(400).json({ status: false, message: 'TOE Reviewer for this Reviewer and TOE already exists' });
        }

        const newTOEReviewer = await TOEReviewer.create({
            reviewer_id,
            toe_id,
            is_lead_reviewer
        });

        res.status(201).json({
            status: true,
            message: 'TOE Reviewer created successfully',
            data: newTOEReviewer
        });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};

exports.getAllTOEReviewer = async (req, res) => {
    try {
        const allTOEReviewers = await TOEReviewer.findAll();
        res.status(200).json({
            status: true,
            message: 'TOE Reviewers retrieved successfully',
            data: allTOEReviewers
        });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};

exports.deleteTOEReviewerByTOEIdAndReviewerId = async (req, res) => {
    try {
        const { reviewer_id, toe_id } = req.body;

        const TOEReviewerFound = await TOEReviewer.findOne({
            where: { reviewer_id, toe_id }
        });

        if (!TOEReviewerFound) {
            return res.status(404).json({ status: false, message: 'TOE Reviewer with that reviewer_id and toe_id not found' });
        }

        await TOEReviewerFound.destroy();
        res.status(200).json({ status: true, message: 'TOE Reviewer deleted successfully' });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};