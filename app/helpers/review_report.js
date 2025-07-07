const fs = require("fs-extra");
const path = require("path");
const { createReport } = require("docx-templates");
const { imageSize } = require('image-size');
const libre = require('libreoffice-convert');
const { v4: uuidv4 } = require('uuid');

const { EOR, TOE, EORAnalysis, Reviewer, TOEReviewer, EORSchedule, EORIssue, EORIssueReviewer, EORIssueReview, EORIssueReviewAttachment, EORIssueAttachment, EORScheduleReview } = require('../models');


exports.getEORSummaryByEORId = async (id) => {
    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }

    try {
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
            return null;
        }
        let EORFoundJSON = EORFound.toJSON();

        // Format tanggal utama
        EORFoundJSON.workbook_released_date = formatDate(EORFoundJSON.workbook_released_date);

        // Format tanggal di eor_schedule
        if (EORFoundJSON.eor_schedule) {
            EORFoundJSON.eor_schedule.schedule_on_evaluation_work_plan_start = formatDate(EORFoundJSON.eor_schedule.schedule_on_evaluation_work_plan_start);
            EORFoundJSON.eor_schedule.schedule_on_evaluation_work_plan_end = formatDate(EORFoundJSON.eor_schedule.schedule_on_evaluation_work_plan_end);
            EORFoundJSON.eor_schedule.execution_time_on_workbook_start = formatDate(EORFoundJSON.eor_schedule.execution_time_on_workbook_start);
            EORFoundJSON.eor_schedule.execution_time_on_workbook_end = formatDate(EORFoundJSON.eor_schedule.execution_time_on_workbook_end);

            if (EORFoundJSON.eor_schedule.eor_schedule_review) {
                EORFoundJSON.eor_schedule.eor_schedule_review.review_date = formatDate(EORFoundJSON.eor_schedule.eor_schedule_review.review_date);
            }
        }

        // Flatten dan format tanggal dalam eor_issues
        if (EORFoundJSON && EORFoundJSON.eor_issues) {
            EORFoundJSON.eor_issues = EORFoundJSON.eor_issues.map(issue => {
                const originalReviewer = issue.eor_issue_reviewer;
                const toeReviewer = originalReviewer?.toe_reviewer;
                const reviewer = toeReviewer?.reviewer;

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

                // Ambil review jika ada
                const review = originalReviewer?.eor_issue_review ?? null;
                if (review) {
                    review.review_date = formatDate(review.review_date);
                }

                return {
                    id: issue.id,
                    cc_components: issue.cc_components,
                    evaluation_reference: issue.evaluation_reference,
                    issue_description: issue.issue_description,
                    eor_issue_attachments: issue.eor_issue_attachments ?? [],
                    eor_issue_reviewer: flattenedReviewer,
                    eor_issue_review: review,
                };
            });
        }
        return EORFoundJSON
    } catch (err) {
        return null;

    }
};

exports.generateRRWordDocument = async (data) => {
    try {
        const template = fs.readFileSync(
            path.resolve(__dirname, "templates/format_rr_eor.docx")
        );

        const report = await createReport({
            template,
            data,
            additionalJsContext: {
                dateFormatter: (date) => {
                    const d = new Date(date);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
                    const year = d.getFullYear();
                    return `${day}/${month}/${year}`;
                },
                generateEORIssueAttachmentImage: (attachment) => {
                    try {
                        if (attachment.mime_type != 'image/png' && attachment.mime_type != 'image/jpeg') {
                            return null
                        }

                        const filePath = path.resolve(__dirname, '../uploads/eor_issue_attachment', attachment.file_uuid);

                        const data = fs.readFileSync(filePath);
                        const dimensions = imageSize(data);
                        const aspectRatio = dimensions.width / dimensions.height;

                        return {
                            data,
                            width: 8.55,
                            height: 8.55 / aspectRatio,
                            extension: attachment.mime_type == 'image/png' ? '.png' : '.jpg',
                        };
                    } catch (err) {
                        console.error(`Error generating image for ${attachment.file_uuid}: ${err.message}`);
                        return null;
                    }
                },
                generateEORIssueReviewAttachmentImage: (attachment) => {
                    try {
                        if (attachment.mime_type != 'image/png' && attachment.mime_type != 'image/jpeg') {
                            return null
                        }

                        const filePath = path.resolve(__dirname, '../uploads/eor_issue_review_attachment/', attachment.file_uuid);

                        const data = fs.readFileSync(filePath);
                        const dimensions = imageSize(data);
                        const aspectRatio = dimensions.width / dimensions.height;

                        return {
                            data,
                            width: 8.55,
                            height: 8.55 / aspectRatio,
                            extension: attachment.mime_type == 'image/png' ? '.png' : '.jpg',
                        };
                    } catch (err) {
                        console.error(`Error generating image for ${attachment.file_uuid}: ${err.message}`);
                        return null;
                    }
                },
                generateSignerSpeciment: (signer) => {
                    try {
                        if (signer === null) return null;

                        const filePath = path.resolve(__dirname, '../uploads/speciment/', signer.file_uuid);

                        const data = fs.readFileSync(filePath);
                        const dimensions = imageSize(data);
                        const aspectRatio = dimensions.width / dimensions.height;

                        return {
                            data,
                            width: 5,
                            height: 5 / aspectRatio,
                            extension: signer.mime_type == 'image/png' ? '.png' : '.jpg',
                        };
                    } catch (err) {
                        console.error(`Error generating image for ${signer.file_uuid}: ${err.message}`);
                        return null;
                    }
                },
            },
        });

        return {
            buffer: report,
            filename: 'output_rr_eor.docx',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };

    }
    catch (err) {
        console.error(`Error generating RR Word Document Preview:`, err);
        return null;
    }
}

exports.generateRRPDFDocument = async (reportBuffer) => {
    try {
        const pdfBuffer = await new Promise((resolve, reject) => {
            libre.convert(reportBuffer, '.pdf', undefined, (err, done) => {
                if (err) {
                    return reject(`Error converting to PDF: ${err}`);
                }
                resolve(done);
            });
        });

        const uuid = uuidv4();
        const file_uuid = `${uuid}.pdf`
        const outputPath = path.resolve(__dirname, '../reviewreports/', file_uuid);

        fs.writeFileSync(outputPath, pdfBuffer);
        return {
            buffer: pdfBuffer,
            filename: file_uuid,
            mimeType: 'application/pdf',
        };
    } catch (err) {
        return null
    }
}

exports.generateRRReviewPDFDocument = async (reportBuffer) => {
    try {
        const tempDirPath = path.resolve(__dirname, '../temp/');
        await fs.emptyDir(tempDirPath);

        const pdfBuffer = await new Promise((resolve, reject) => {
            libre.convert(reportBuffer, '.pdf', undefined, (err, done) => {
                if (err) {
                    return reject(`Error converting to PDF: ${err}`);
                }
                resolve(done);
            });
        });

        const uuid = uuidv4();
        const file_uuid = `${uuid}.pdf`
        const outputPath = path.resolve(__dirname, '../temp/', file_uuid);

        fs.writeFileSync(outputPath, pdfBuffer);
        return {
            buffer: pdfBuffer,
            filename: file_uuid,
            mimeType: 'application/pdf',
        };
    } catch (err) {
        return null
    }
}


exports.formatDateWithSuperscript = (yyyyMMdd) => {
    const date = new Date(yyyyMMdd);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();

    const suffix =
        (day >= 11 && day <= 13) ? 'ᵗʰ'
            : (day % 10 === 1) ? 'ˢᵗ'
                : (day % 10 === 2) ? 'ⁿᵈ'
                    : (day % 10 === 3) ? 'ʳᵈ'
                        : 'ᵗʰ';

    return `${month} ${day}${suffix} ${year}`;
}

exports.formatTanggalIndo = (yyyyMMdd) => {
    const date = new Date(yyyyMMdd);
    const hari = date.getDate();
    const bulan = date.toLocaleString('id-ID', { month: 'long' });
    const tahun = date.getFullYear();

    return `${hari} ${bulan} ${tahun}`;
}