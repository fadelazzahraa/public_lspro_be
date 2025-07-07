const { EOR, TOE, EORAnalysis, Reviewer, TOEReviewer, EORSchedule, EORIssue, EORIssueReviewer, EORIssueReview, EORIssueReviewAttachment, EORIssueAttachment, EORScheduleReview, EORReviewReport } = require('../models');

exports.createEOR = async (req, res) => {
    try {
        const {
            project_id,
            workbook_id,
            work_package,
            deliverables_reference,
            cc_components,
            workbook_released_date,
            toe_id
        } = req.body;

        const TOEFound = await TOE.findByPk(toe_id);
        if (!TOEFound) {
            return res.status(404).json({ status: false, message: 'TOE not found' });
        }

        const newEOR = await EOR.create({
            project_id,
            workbook_id,
            work_package,
            deliverables_reference,
            cc_components,
            workbook_released_date,
            toe_id
        });

        res.status(201).json({
            status: true,
            message: 'EOR created successfully',
            data: newEOR
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error creating EOR' });
    }
};

exports.getAllEOR = async (req, res) => {
    try {
        const allEOR = await EOR.findAll();
        res.status(200).json({
            status: true,
            message: 'EORs retrieved successfully',
            data: allEOR
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EORs' });
    }
};

exports.getEORById = async (req, res) => {
    try {
        const id = req.params.id;

        const EORFound = await EOR.findByPk(id, {
            include: [
                {
                    model: EORReviewReport,

                },
            ]
        });
        if (!EORFound) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }

        res.status(200).json({
            status: true,
            message: 'EOR found',
            data: EORFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR' });
    }
};



exports.updateEOR = async (req, res) => {
    try {
        const id = req.params.id;

        const EORFound = await EOR.findByPk(id);
        if (!EORFound) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }

        await EORFound.update(req.body);
        res.status(200).json({
            status: true,
            message: 'EOR updated successfully',
            data: EORFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error updating EOR' });
    }
};

exports.deleteEOR = async (req, res) => {
    try {
        const id = req.params.id;

        const EORFound = await EOR.findByPk(id, {
            include: [
                {
                    model: EORIssue,
                },
                {
                    model: EORReviewReport,

                },
            ]
        });
        if (!EORFound) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }

        if (EORFound.eor_issues.length > 0) {
            return res.status(400).json({ status: false, message: "Cannot delete EOR: there are EOR Issues" });
        }

        if (EORFound.eor_reviewreport) {
            return res.status(400).json({ status: false, message: "Cannot delete EOR: there are EOR Review Report" });
        }

        await EORFound.destroy();
        res.status(200).json({ status: false, message: 'EOR deleted successfully' });
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, message: 'Error deleting EOR' });
    }
};


exports.getEORSummaryById = async (req, res) => {
    try {
        const id = req.params.id;

        const EORFound = await EOR.findByPk(id, {
            attributes: ['id', 'project_id', 'workbook_id', 'work_package', 'deliverables_reference', 'cc_components', 'workbook_released_date'],
            include: [{
                model: TOE,
                attributes: ['id', 'title', 'version', 'eal'],

            },
            {
                model: EORIssue,
                attributes: ['id', 'cc_components', 'evaluation_reference', 'issue_description'],
                include: [{
                    model: EORIssueReviewer,
                    attributes: ['id', 'is_active'],
                    include: [
                        {
                            model: TOEReviewer,
                            attributes: ['id', 'is_active'],
                            include: [{
                                model: Reviewer,
                                attributes: ['id', 'name', 'title', 'is_active'],
                            }],
                        },
                        {
                            model: EORIssueReview,
                            attributes: ['id', 'review_date', 'reviewer_review', 'status'],
                            include: [{
                                model: EORIssueReviewAttachment,
                                attributes: ['id', 'file_uuid', 'title', 'mime_type', 'description'],
                            }],
                        }]
                }, {
                    model: EORIssueAttachment,
                    attributes: ['id', 'file_uuid', 'title', 'mime_type', 'description'],
                }
                ]
            }, {
                model: EORSchedule,
                attributes: ['id', 'schedule_on_evaluation_work_plan_start', 'schedule_on_evaluation_work_plan_end', 'execution_time_on_workbook_start', 'execution_time_on_workbook_end'],
                include: [{
                    model: EORScheduleReview,
                    attributes: ['id', 'review_date', 'reviewer_review'],
                }]

            }, {
                model: EORAnalysis,
                attributes: ['id', 'analysis', 'meeting_type', 'meeting_decision'],
            }
            ],

        });
        if (!EORFound) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }
        let EORFoundJSON = EORFound.toJSON();

        if (EORFoundJSON && EORFoundJSON.eor_issues) {
            EORFoundJSON.eor_issues = EORFoundJSON.eor_issues.map(issue => {
                const originalReviewer = issue.eor_issue_reviewer;
                const toeReviewer = originalReviewer?.toe_reviewer;
                const reviewer = toeReviewer?.reviewer;
                const eorReview = originalReviewer?.eor_issue_review;

                const flattenedReviewer = originalReviewer
                    ? {
                        id: originalReviewer.id,
                        is_active: originalReviewer.is_active,
                        toe_reviewer_id: toeReviewer?.id ?? null,
                        toe_reviewer_is_active: toeReviewer?.is_active ?? null,
                        reviewer_id: reviewer?.id ?? null,
                        reviewer_name: reviewer?.name ?? null,
                        reviewer_title: reviewer?.title ?? null,
                        reviewer_is_active: reviewer?.is_active ?? null,
                    }
                    : null;

                return {
                    id: issue.id,
                    cc_components: issue.cc_components,
                    evaluation_reference: issue.evaluation_reference,
                    issue_description: issue.issue_description,
                    eor_issue_attachments: issue.eor_issue_attachments ?? [],
                    eor_issue_reviewer: flattenedReviewer,
                    eor_issue_review: originalReviewer?.eor_issue_review ?? null,
                };
            });
        }

        res.status(200).json({
            status: true,
            message: 'EOR found',
            data: EORFoundJSON
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR' });
    }
};