const { EORIssue, EOR, EORIssueReview, EORIssueReviewer, TOEReviewer, Reviewer, EORIssueAttachment, EORIssueReviewAttachment } = require('../models'); // pastikan path models sesuai

exports.createEORIssue = async (req, res) => {
    try {
        const { cc_components, evaluation_reference, issue_description, eor_id } = req.body;

        const EORFound = await EOR.findByPk(eor_id);
        if (!EORFound) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }

        const newEORIssue = await EORIssue.create({
            cc_components,
            evaluation_reference,
            issue_description,
            eor_id
        });

        res.status(201).json({
            status: true,
            message: 'EOR Issue created successfully',
            data: newEORIssue
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error creating EOR Issue' });
    }
};

exports.getAllEORIssue = async (req, res) => {
    try {
        const EORIssuesFound = await EORIssue.findAll(
            {
                include: [
                    {
                        model: EORIssueReviewer,
                        attributes: ['id', 'is_active'],
                        include: [
                            {
                                model: EORIssueReview,
                                attributes: ['id', 'review_date', 'reviewer_review', 'status'],
                                include: [
                                    {
                                        model: EORIssueReviewAttachment,
                                        attributes: ['id', 'file_uuid', 'title', 'mime_type', 'description', 'att_number']
                                    }
                                ],
                            },
                            {
                                model: TOEReviewer,
                                attributes: ['id', 'is_lead_reviewer', 'is_active'],
                                include: [
                                    {
                                        model: Reviewer,
                                        attributes: ['id', 'name', 'title']
                                    }
                                ],
                            }
                        ]
                    },
                    {
                        model: EORIssueAttachment,
                        attributes: ['id', 'file_uuid', 'title', 'mime_type', 'description', 'att_number']
                    }

                ]
            }
        );
        res.status(200).json({
            status: true,
            message: 'EOR Issues retrieved successfully',
            data: EORIssuesFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Issues' });
    }
};

exports.getAllEORIssueOfEORbyEORId = async (req, res) => {
    try {
        const eor_id = req.params.id;
        const EORIssuesFound = await EORIssue.findAll(
            {
                where: {
                    eor_id: eor_id
                },
                include: [
                    {
                        model: EORIssueReviewer,
                        attributes: ['id', 'is_active'],
                        include: [
                            {
                                model: EORIssueReview,
                                attributes: ['id', 'review_date', 'reviewer_review', 'status'],
                                include: [
                                    {
                                        model: EORIssueReviewAttachment,
                                        attributes: ['id', 'file_uuid', 'title', 'mime_type', 'description', 'att_number']
                                    }
                                ],
                            },
                            {
                                model: TOEReviewer,
                                attributes: ['id', 'is_lead_reviewer', 'is_active'],
                                include: [
                                    {
                                        model: Reviewer,
                                        attributes: ['id', 'name', 'title']
                                    }
                                ],
                            }
                        ]
                    },
                    {
                        model: EORIssueAttachment,
                        attributes: ['id', 'file_uuid', 'title', 'mime_type', 'description', 'att_number']
                    }
                ]
            }
        );
        res.status(200).json({
            status: true,
            message: 'EOR Issues of EOR retrieved successfully',
            data: EORIssuesFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Issues' });
    }
};

exports.getEORIssueById = async (req, res) => {
    try {
        const id = req.params.id;
        const EORIssueFound = await EORIssue.findByPk(id, {
            include: [
                {
                    model: EORIssueReviewer,
                    attributes: ['id', 'is_active'],
                    include: [
                        {
                            model: EORIssueReview,
                            attributes: ['id', 'review_date', 'reviewer_review', 'status'],
                            include: [
                                {
                                    model: EORIssueReviewAttachment,
                                    attributes: ['id', 'file_uuid', 'title', 'mime_type', 'description', 'att_number']
                                }
                            ],
                        },
                        {
                            model: TOEReviewer,
                            attributes: ['id', 'is_active'],
                            include: [
                                {
                                    model: Reviewer,
                                    attributes: ['id', 'name', 'title']
                                }
                            ],
                        }
                    ]
                },
                {
                    model: EORIssueAttachment,
                    attributes: ['id', 'file_uuid', 'title', 'mime_type', 'description', 'att_number']
                }

            ]
        });

        if (!EORIssueFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue not found' });
        }

        res.status(200).json({
            status: true,
            message: 'EOR Issue retrieved successfully',
            data: EORIssueFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Issue' });
    }
};


exports.updateEORIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { cc_components, evaluation_reference, issue_description } = req.body;

        const EORIssueFound = await EORIssue.findByPk(id);
        if (!EORIssueFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue not found' });
        }

        await EORIssueFound.update({
            cc_components,
            evaluation_reference,
            issue_description,
        });

        res.status(200).json({
            status: true,
            message: 'EOR Issue updated successfully',
            data: EORIssueFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error updating EOR Issue' });
    }
};

exports.deleteEORIssue = async (req, res) => {
    try {
        const { id } = req.params;

        const EORIssueFound = await EORIssue.findByPk(id, {
            include: [
                EORIssueAttachment,
                {
                    model: EORIssueReviewer,
                    include: {
                        model: EORIssueReview,
                        include: [EORIssueReviewAttachment]
                    }
                }
            ]
        });
        if (!EORIssueFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue not found' });
        }

        const hasIssueAttachments = EORIssueFound.eor_issue_attachments.length > 0;
        const hasReviewAttachments =
            EORIssueFound.eor_issue_reviewer?.eor_issue_review?.eor_issue_review_attachments.length > 0;

        if (hasIssueAttachments || hasReviewAttachments) {
            return res.status(404).json({ status: false, message: 'Cannot delete EOR Issue: there are attachments' });
        }

        await EORIssueFound.destroy();

        res.status(200).json({ status: true, message: 'EOR Issue deleted successfully' });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error deleting EOR Issue' });
    }
};
