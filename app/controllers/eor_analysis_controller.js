const { EORAnalysis, EOR, TOEReviewer, Reviewer } = require('../models');

exports.createEORAnalysis = async (req, res) => {
    try {
        const { eor_id, analysis, meeting_type, meeting_decision } = req.body;
        const user_id = req.user.id;

        const EORFound = await EOR.findByPk(eor_id);
        if (!EORFound) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

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

        const EORAnalysisFound = await EORAnalysis.findOne({
            where: {
                eor_id: eor_id,
            }
        });
        if (EORAnalysisFound) {
            return res.status(400).json({ status: false, message: 'EOR Analysis for this EOR already exists. Do update instead of create new' });
        }

        const newEORAnalysis = await EORAnalysis.create({
            analysis,
            meeting_type,
            meeting_decision,
            eor_id,
            toe_reviewer_id_list: [TOEReviewerFound.id],
        });
        res.status(201).json({
            status: true,
            message: 'EOR Analysis created successfully',
            data: newEORAnalysis
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error creating EOR Analysis' });
    }
};

exports.getAllEORAnalysis = async (req, res) => {
    try {
        const EORAnalysisList = await EORAnalysis.findAll();
        res.status(200).json({
            status: true,
            message: 'EOR Analyses retrieved successfully',
            data: EORAnalysisList
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Analysis' });
    }
};

exports.getEORAnalysisById = async (req, res) => {
    try {
        const id = req.params.id;

        const EORAnalysisFound = await EORAnalysis.findByPk(id);
        if (!EORAnalysisFound) {
            return res.status(404).json({ status: false, message: 'EOR Analysis not found' });
        }
        res.status(200).json({
            status: true,
            message: 'EOR Analysis retrieved successfully',
            data: EORAnalysisFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Analysis by ID' });
    }
};

exports.getEORAnalysisByEORId = async (req, res) => {
    try {
        const eor_id = req.params.id;

        const EORAnalysisFound = await EORAnalysis.findOne({ where: { eor_id: eor_id } });
        res.status(200).json({
            status: true,
            message: 'EOR Analysis of EOR retrieved successfully',
            data: EORAnalysisFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Analysis by ID' });
    }
};

exports.updateEORAnalysis = async (req, res) => {
    try {
        const id = req.params.id;
        const { analysis, meeting_type, meeting_decision } = req.body;
        const user_id = req.user.id;

        const EORAnalysisFound = await EORAnalysis.findByPk(id);
        if (!EORAnalysisFound) {
            return res.status(404).json({ status: false, message: 'EOR Analysis not found' });
        }

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        const EORFound = await EOR.findByPk(EORAnalysisFound.eor_id);
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

        EORAnalysisFound.analysis = analysis ?? EORAnalysisFound.analysis;
        EORAnalysisFound.meeting_type = meeting_type ?? EORAnalysisFound.meeting_type;
        EORAnalysisFound.meeting_decision = meeting_decision ?? EORAnalysisFound.meeting_decision;

        if (
            TOEReviewerFound &&
            TOEReviewerFound.id &&
            !EORAnalysisFound.toe_reviewer_id_list.includes(TOEReviewerFound.id)
        ) {
            EORAnalysisFound.toe_reviewer_id_list.push(TOEReviewerFound.id);
        }

        await EORAnalysisFound.save();
        res.status(201).json({
            status: true,
            message: 'EOR Analysis updated successfully',
            data: EORAnalysisFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error updating EOR Analysis' });
    }
};

exports.deleteEORAnalysis = async (req, res) => {
    try {
        const id = req.params.id;
        const EORAnalysisFound = await EORAnalysis.findByPk(id);

        if (!EORAnalysisFound) {
            return res.status(404).json({ status: false, message: 'EOR Analysis not found' });
        }
        await EORAnalysisFound.destroy();
        res.status(200).json({ status: true, message: 'EOR Analysis deleted successfully' });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error deleting EOR Analysis' });
    }
};
