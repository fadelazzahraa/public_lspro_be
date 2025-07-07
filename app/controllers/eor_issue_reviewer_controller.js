const { EORIssueReviewer, TOEReviewer, Reviewer, EOR, EORIssue } = require('../models');

exports.createEORIssueReviewer = async (req, res) => {
    try {
        const { reviewer_id, eor_issue_id } = req.body;
        const user_id = req.user.id;

        const ReviewerFound = await Reviewer.findByPk(reviewer_id);
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Reviewer not found' });
        }

        const EORIssueFound = await EORIssue.findByPk(eor_issue_id);
        if (!EORIssueFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue not found' });
        }

        const EORFound = await EOR.findByPk(EORIssueFound.eor_id);
        const TOEReviewerFound = await TOEReviewer.findOne({
            where: {
                reviewer_id: reviewer_id,
                toe_id: EORFound.toe_id
            }
        });
        if (!TOEReviewerFound) {
            return res.status(404).json({ status: false, message: 'TOE Reviewer for this Reviewer and TOE of this EOR Issue not found' });
        }

        if (ReviewerFound && !ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Reviewer is not active' });
        }
        if (!TOEReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'TOE Reviewer is not active' });
        }


        const ThisReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ThisReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ThisReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        const ThisTOEReviewerFound = await TOEReviewer.findOne({
            where: {
                reviewer_id: ThisReviewerFound.id,
                toe_id: EORFound.toe_id
            }
        });

        if (ThisReviewerFound.role !== 'admin' && !ThisTOEReviewerFound) {
            return res.status(404).json({ status: false, message: 'You are not Admin and your Reviewer not assigned as TOE Reviewer of this TOE' });
        }
        if (ThisReviewerFound.role !== 'admin' && !ThisTOEReviewerFound.is_lead_reviewer) {
            console.log('do')
            return res.status(404).json({ status: false, message: 'You are not Admin and your TOE Reviewer of this TOE is not Lead Auditor' });
        }

        const EORIssueReviewerFound = await EORIssueReviewer.findOne({
            where: {
                toe_reviewer_id: TOEReviewerFound.id,
                eor_issue_id: eor_issue_id
            }
        });
        if (EORIssueReviewerFound) {
            return res.status(400).json({ status: false, message: 'EOR Issue Reviewer for this EOR Reviewer and EOR Issue already exists' });
        }

        const newEORIssueReviewer = await EORIssueReviewer.create({
            toe_reviewer_id: TOEReviewerFound.id,
            eor_issue_id: eor_issue_id
        });
        res.status(201).json({
            status: 'true',
            message: 'EOR Issue Reviewer created successfully',
            data: newEORIssueReviewer
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error creating EOR Issue Reviewer' });
    }
};

exports.getAllEORIssueReviewer = async (req, res) => {
    try {
        const allEORIssueReviewer = await EORIssueReviewer.findAll();
        res.status(200).json({
            status: true,
            message: 'EOR Issue Reviewers retrieved successfully',
            data: allEORIssueReviewer
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Issue Reviewer' });
    }
};

exports.getEORIssueReviewerById = async (req, res) => {
    try {
        const id = req.params.id;

        const EORIssueReviewerFound = await EORIssueReviewer.findByPk(id);
        if (!EORIssueReviewerFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue Reviewer not found' });
        }

        res.status(200).json({
            status: true,
            message: 'EOR Issue Reviewer retrieved successfully',
            data: EORIssueReviewerFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Issue Reviewer' });
    }
};

exports.updateEORIssueReviewer = async (req, res) => {
    try {
        const id = req.params.id;
        const { is_active } = req.body;

        const EORIssueReviewerFound = await EORIssueReviewer.findByPk(id);
        if (!EORIssueReviewerFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue Reviewer not found' });
        }

        EORIssueReviewerFound.is_active = is_active;
        await EORIssueReviewerFound.save();

        res.status(200).json({
            status: true,
            message: 'EOR Issue Reviewer updated successfully',
            data: EORIssueReviewerFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error updating EOR Issue Reviewer' });
    }
};

exports.deleteEORIssueReviewer = async (req, res) => {
    try {
        const id = req.params.id;

        const EORIssueReviewerFound = await EORIssueReviewer.findByPk(id);
        if (!EORIssueReviewerFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue Reviewer not found' })
        };

        await EORIssueReviewerFound.destroy();
        res.status(200).json({ status: true, message: 'EOR Issue Reviewer deleted successfully' });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error deleting EOR Issue Reviewer' });
    }
};
