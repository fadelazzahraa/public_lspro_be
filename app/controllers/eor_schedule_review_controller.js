const { EORSchedule, EOR, TOEReviewer, EORScheduleReview, Reviewer } = require('../models');

exports.createEORScheduleReview = async (req, res) => {
    try {
        const { eor_schedule_id, reviewer_review } = req.body;

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

        const EORScheduleFound = await EORSchedule.findByPk(eor_schedule_id);
        if (!EORScheduleFound) {
            return res.status(404).json({ status: false, message: 'EOR Schedule not found' });
        }

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        const EORFound = await EOR.findByPk(EORScheduleFound.eor_id);
        const TOEReviewerFound = await TOEReviewer.findOne({
            where: {
                toe_id: EORFound.toe_id,
                reviewer_id: ReviewerFound.id,
            }
        });
        if (!TOEReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your Reviewer not assigned as TOE Reviewer for this TOE' });
        }
        if (!TOEReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your TOE Reviewer is not active' });
        }

        const EORScheduleReviewFound = await EORScheduleReview.findOne({
            where: {
                eor_schedule_id: eor_schedule_id,
            }
        });
        if (EORScheduleReviewFound) {
            return res.status(400).json({ status: false, message: 'EOR Schedule Review for this EOR Schedule already exists. Do update instead of create new' });
        }

        const newEORScheduleReview = await EORScheduleReview.create({
            review_date,
            reviewer_review,
            eor_schedule_id,
            toe_reviewer_id_list: [TOEReviewerFound.id],
        });

        res.status(201).json({
            status: true,
            message: 'EOR Schedule Review created successfully',
            data: newEORScheduleReview
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error creating EOR Schedule Review' });
    }
};

exports.getAllEORScheduleReview = async (req, res) => {
    try {
        const EORScheduleReviewList = await EORScheduleReview.findAll();
        res.status(200).json({
            status: true,
            message: 'EOR Schedule Reviews retrieved successfully',
            data: EORScheduleReviewList
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Schedule Review' });
    }
};

exports.getEORScheduleReviewById = async (req, res) => {
    try {
        const id = req.params.id;

        const EORScheduleReviewFound = await EORAnalysis.findByPk(id);
        if (!EORScheduleReviewFound) {
            return res.status(404).json({ status: false, message: 'EOR Schedule Review not found' });
        }
        res.status(200).json({
            status: true,
            message: 'EOR Schedule Review retrieved successfully',
            data: EORScheduleReviewFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Schedule Review' });
    }
};

exports.updateEORScheduleReview = async (req, res) => {
    try {
        const id = req.params.id;
        const { reviewer_review } = req.body;

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

        const EORScheduleReviewFound = await EORScheduleReview.findByPk(id);
        if (!EORScheduleReviewFound) {
            return res.status(404).json({ status: false, message: 'EOR Schedule Review not found' });
        }

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        const EORScheduleFound = await EORSchedule.findByPk(EORScheduleReviewFound.eor_schedule_id);
        const EORFound = await EOR.findByPk(EORScheduleFound.eor_id);
        const TOEReviewerFound = await TOEReviewer.findOne({
            where: {
                toe_id: EORFound.toe_id,
                reviewer_id: ReviewerFound.id,
            }
        });
        if (!TOEReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your Reviewer not assigned as TOE Reviewer for this TOE' });
        }
        if (!TOEReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your TOE Reviewer is not active' });
        }

        EORScheduleReviewFound.review_date = review_date;
        EORScheduleReviewFound.reviewer_review = reviewer_review;
        if (!EORScheduleReviewFound.toe_reviewer_id_list.includes(TOEReviewerFound.id)) {
            EORScheduleReviewFound.toe_reviewer_id_list.push(TOEReviewerFound.id);
        }
        await EORScheduleReviewFound.save();

        res.status(200).json({
            status: true,
            message: 'EOR Schedule Review updated successfully',
            data: EORScheduleReviewFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error updating EOR Schedule Review', });
    }
};

exports.deleteEORScheduleReview = async (req, res) => {
    try {
        const id = req.params.id;
        const EORScheduleReviewFound = await EORScheduleReview.findByPk(id);

        if (!EORScheduleReviewFound) {
            return res.status(404).json({ status: false, message: 'EOR Schedule Review not found' });
        }
        await EORScheduleReviewFound.destroy();
        res.status(200).json({
            status: true,
            message: 'EOR Schedule Review deleted successfully'
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error deleting EOR Schedule Review' });
    }
};
