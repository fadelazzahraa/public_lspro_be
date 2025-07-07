const { TOE, EOR, Reviewer, TOEReviewer } = require('../models');

exports.createTOE = async (req, res) => {
    try {
        const user_id = req.user.id;

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        if (ReviewerFound.role !== 'admin') {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not allowed to create TOE' })
        }

        const { title, version, eal } = req.body;
        const newTOE = await TOE.create({
            title,
            version,
            eal
        });
        res.status(201).json({
            status: true,
            message: 'TOE created successfully',
            data: newTOE
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

exports.getAllTOE = async (req, res) => {
    try {
        const { reviewer_id } = req.query;

        let TOEs;

        if (!reviewer_id) {
            TOEs = await TOE.findAll({
                include: [
                    {
                        model: Reviewer,
                        through: {
                            attributes: ['is_lead_reviewer', 'is_active']
                        },
                    },
                ],
                order: [['id', 'ASC']],
            });
        } else {
            const TOEReviewers = await TOEReviewer.findAll({
                where: { reviewer_id },
                attributes: ['toe_id'],
            });

            const toeIds = TOEReviewers.map(tr => tr.toe_id);

            TOEs = await TOE.findAll({
                where: { id: toeIds },
                include: [
                    {
                        model: Reviewer,
                        through: {
                            attributes: ['is_lead_reviewer', 'is_active']
                        },
                    },
                ],
                order: [['id', 'ASC']],
            });
        }

        const transformedTOEs = TOEs.map(toe => {
            const toeObj = toe.toJSON();

            const transformedReviewers = toeObj.reviewers
                .map(reviewer => ({
                    ...reviewer,
                    toe_reviewer_is_lead_reviewer: reviewer.toe_reviewer?.is_lead_reviewer ?? null,
                    toe_reviewer_is_active: reviewer.toe_reviewer?.is_active ?? null,
                }))
                .map(({ toe_reviewer, ...rest }) => rest) // hapus toe_reviewer
                .sort((a, b) => a.id - b.id);

            return {
                ...toeObj,
                reviewers: transformedReviewers
            };
        });
        res.status(200).json({
            status: true,
            message: 'TOE retrieved successfully',
            data: transformedTOEs
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

exports.getTOEById = async (req, res) => {
    try {
        const id = req.params.id;

        const foundTOE = await TOE.findByPk(id, {
            include: [
                {
                    model: Reviewer,
                    through: {
                        attributes: ['is_lead_reviewer', 'is_active']
                    }
                },
            ],
        });
        if (!foundTOE) {
            return res.status(404).json({ status: false, message: 'TOE not found' });
        }

        const transformedReviewers = foundTOE.reviewers
            .map(reviewer => {
                const reviewerObj = reviewer.toJSON();
                return {
                    ...reviewerObj,
                    toe_reviewer_is_lead_reviewer: reviewerObj.toe_reviewer?.is_lead_reviewer ?? null,
                    toe_reviewer_is_active: reviewerObj.toe_reviewer?.is_active ?? null,
                };
            })
            .map(({ toe_reviewer, ...rest }) => rest)
            .sort((a, b) => a.id - b.id);

        const responseTOE = foundTOE.toJSON();
        responseTOE.reviewers = transformedReviewers;

        res.status(200).json({
            status: true,
            message: 'TOE retrieved successfully',
            data: responseTOE
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

exports.getEOROfTOEById = async (req, res) => {
    try {
        const id = req.params.id;

        const foundTOE = await TOE.findByPk(id);
        if (!foundTOE) {
            return res.status(404).json({ status: false, message: 'TOE not found' });
        }
        const EORFound = await EOR.findAll({
            where: {
                toe_id: id
            },
        });

        res.status(200).json({
            status: false,
            message: 'EOR of TOE retrieved successfully',
            data: EORFound
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

exports.updateTOE = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, version, eal } = req.body;

        const foundTOE = await TOE.findByPk(id);
        if (!foundTOE) {
            return res.status(404).json({ status: false, message: 'TOE not found' });
        }

        await foundTOE.update({ title, version, eal });
        res.status(200).json({
            status: true,
            message: 'TOE updated successfully',
            data: foundTOE
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

exports.deleteTOE = async (req, res) => {
    try {
        const id = req.params.id;
        const foundTOE = await TOE.findByPk(id, {
            include: [
                {
                    model: EOR,
                }
            ],
        });
        if (!foundTOE) {
            return res.status(404).json({ status: false, message: 'TOE not found' });
        }

        if (foundTOE.eors.length > 0) {
            return res.status(400).json({
                status: true, message: "Cannot delete TOE: there are EOR",
            });
        }

        await foundTOE.destroy();
        res.status(200).json({ status: true, message: 'TOE deleted' });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};


