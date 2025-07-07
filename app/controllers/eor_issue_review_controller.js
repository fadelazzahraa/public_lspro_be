const { EORIssue, TOEReviewer, Reviewer, EORIssueReviewer, EORIssueReview, EOR } = require('../models');

exports.createEORIssueReview = async (req, res) => {
    try {
        const { eor_issue_id, reviewer_review, status } = req.body;

        const now = new Date();

        // Tambah offset WIB (UTC+7)
        const wibOffset = 7 * 60; // dalam menit
        const localTime = new Date(now.getTime() + (wibOffset - now.getTimezoneOffset()) * 60000);

        const year = localTime.getFullYear();
        const month = String(localTime.getMonth() + 1).padStart(2, '0');
        const date = String(localTime.getDate()).padStart(2, '0');
        const hours = String(localTime.getHours()).padStart(2, '0');
        const minutes = String(localTime.getMinutes()).padStart(2, '0');
        const seconds = String(localTime.getSeconds()).padStart(2, '0');
        const milliseconds = String(localTime.getMilliseconds()).padStart(3, '0');

        const review_date = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}.${milliseconds}`;

        const user_id = req.user.id;

        const EORIssueFound = await EORIssue.findByPk(eor_issue_id);
        if (!EORIssueFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue not found' });
        }

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        const EORFound = await EOR.findByPk(EORIssueFound.eor_id);
        const TOEReviewerFound = await TOEReviewer.findOne({
            where: {
                toe_id: EORFound.toe_id,
                reviewer_id: ReviewerFound.id,
            }
        });
        if (!TOEReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your Reviewer not assigned as TOE Reviewer for TOE of this EOR Issue' });
        }
        if (!TOEReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your TOE Reviewer is not active' });
        }

        const EORIssueReviewerFound = await EORIssueReviewer.findOne({
            where: {
                eor_issue_id: eor_issue_id,
                toe_reviewer_id: TOEReviewerFound.id
            }
        });
        if (!EORIssueReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your Reviewer is not assigned as EOR Issue Reviewer for this EOR Issue' });
        }
        if (!EORIssueReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your EOR Issue Reviewer is not active' });
        }

        const EORIssueReviewFound = await EORIssueReview.findOne({
            where: {
                eor_issue_reviewer_id: EORIssueReviewerFound.id,
            }
        });
        if (EORIssueReviewFound) {
            return res.status(400).json({ status: false, message: 'EOR Issue Review for your EOR Reviewer and the EOR Issue already exists' });
        }

        const newEORIssueReview = await EORIssueReview.create({
            eor_issue_reviewer_id: EORIssueReviewerFound.id,
            review_date,
            reviewer_review,
            status
        });
        res.status(201).json({
            status: true,
            message: 'EOR Issue Review created successfully',
            data: newEORIssueReview
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error creating EOR Issue Review' });
    }
};


exports.getAllEORIssueReview = async (req, res) => {
    try {
        const EORIssueReviewList = await EORIssueReview.findAll();
        res.status(200).json({
            status: true,
            message: 'EOR Issue Reviews retrieved successfully',
            data: EORIssueReviewList
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Issue Review', });
    }
};

exports.getEORIssueReviewById = async (req, res) => {
    try {
        const id = req.params.id;
        const EORIssueReviewFound = await EORIssueReview.findByPk(id);
        if (!EORIssueReviewFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue Review not found' });
        }
        res.status(200).json({
            status: true,
            message: 'EOR Issue Review retrieved successfully',
            data: EORIssueReviewFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Issue Review by ID' });
    }
};

exports.updateEORIssueReview = async (req, res) => {
    try {
        const id = req.params.id;
        const { reviewer_review, status } = req.body;

        const now = new Date();

        // Tambah offset WIB (UTC+7)
        const wibOffset = 7 * 60; // dalam menit
        const localTime = new Date(now.getTime() + (wibOffset - now.getTimezoneOffset()) * 60000);

        const year = localTime.getFullYear();
        const month = String(localTime.getMonth() + 1).padStart(2, '0');
        const date = String(localTime.getDate()).padStart(2, '0');
        const hours = String(localTime.getHours()).padStart(2, '0');
        const minutes = String(localTime.getMinutes()).padStart(2, '0');
        const seconds = String(localTime.getSeconds()).padStart(2, '0');
        const milliseconds = String(localTime.getMilliseconds()).padStart(3, '0');

        const review_date = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}.${milliseconds}`;

        const user_id = req.user.id;

        const EORIssueReviewFound = await EORIssueReview.findByPk(id);
        if (!EORIssueReviewFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue Review not found' });
        }

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        const EORIssueReviewerFound = await EORIssueReviewer.findByPk(EORIssueReviewFound.eor_issue_reviewer_id);
        const EORIssueFound = await EORIssue.findByPk(EORIssueReviewerFound.eor_issue_id);
        const EORFound = await EOR.findByPk(EORIssueFound.eor_id);
        const TOEReviewerFound = await TOEReviewer.findOne({
            where: {
                toe_id: EORFound.toe_id,
                reviewer_id: ReviewerFound.id,
            }
        });
        if (!TOEReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your Reviewer not assigned as TOE Reviewer for TOE of this EOR Issue' });
        }
        if (!TOEReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your TOE Reviewer is not active' });
        }

        const EORIssueReviewerFound2 = await EORIssueReviewer.findOne({
            where: {
                eor_issue_id: EORIssueFound.id,
                toe_reviewer_id: TOEReviewerFound.id
            }
        });
        if (!EORIssueReviewerFound2) {
            return res.status(404).json({ status: false, message: 'Your Reviewer is not assigned as EOR Issue Reviewer for this EOR Issue' });
        }
        if (!EORIssueReviewerFound2.is_active) {
            return res.status(400).json({ status: false, message: 'Your EOR Issue Reviewer is not active' });
        }

        EORIssueReviewFound.review_date = review_date;
        EORIssueReviewFound.reviewer_review = reviewer_review;
        EORIssueReviewFound.status = status;

        await EORIssueReviewFound.save();
        res.status(200).json({
            status: true,
            message: 'EOR Issue Review updated successfully',
            data: EORIssueReviewFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error updating EOR Issue Review' });
    }
};

exports.deleteEORIssueReview = async (req, res) => {
    try {
        const id = req.params.id;
        const user_id = req.user.id;

        const EORIssueReviewFound = await EORIssueReview.findByPk(id);
        if (!EORIssueReviewFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue Review not found' });
        }

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        const EORIssueReviewerFound = await EORIssueReviewer.findByPk(EORIssueReviewFound.eor_issue_reviewer_id);
        const EORIssueFound = await EORIssue.findByPk(EORIssueReviewFound.eor_issue_id);
        const EORFound = await EOR.findByPk(EORIssueFound.eor_id);
        const TOEReviewerFound = await TOEReviewer.findOne({
            where: {
                toe_id: EORFound.toe_id,
                reviewer_id: ReviewerFound.id,
            }
        });
        if (!TOEReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your Reviewer not assigned as TOE Reviewer for TOE of this EOR Issue' });
        }
        if (!TOEReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your TOE Reviewer is not active' });
        }

        EORIssueReviewerFound = await EORIssueReviewer.findOne({
            where: {
                eor_issue_id: EORIssueFound.id,
                toe_reviewer_id: TOEReviewerFound.id
            }
        });
        if (!EORIssueReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your Reviewer is not assigned as EOR Issue Reviewer for this EOR Issue' });
        }
        if (!EORIssueReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your EOR Issue Reviewer is not active' });
        }

        await EORIssueReviewFound.destroy();
        res.status(200).json({ status: true, message: 'EOR Issue Review deleted successfully' });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error deleting EOR Issue Review' });
    }
};
