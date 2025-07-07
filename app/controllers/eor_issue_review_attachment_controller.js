const { EORIssueReviewAttachment, EORIssueReview, EORIssueReviewer, Reviewer, TOEReviewer, EORIssue, EOR, TOE } = require('../models');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

const uploadPath = "./../uploads/eor_issue_review_attachment"

exports.uploadFileEORIssueReviewAttachment = async (req, res) => {
    try {
        const eor_issue_review_id = req.params.id;
        const { title, description } = req.body;
        const user_id = req.user.id;

        if (!req.file) {
            return res.status(400).json({ status: false, message: 'No file uploaded or invalid file type' });
        }
        const tempPath = req.file.path;

        const EORIssueReviewFound = await EORIssueReview.findByPk(eor_issue_review_id);
        if (!EORIssueReviewFound) {
            await fs.unlink(tempPath).catch(() => { });
            return res.status(404).json({ status: false, message: 'EOR Issue Review not found' });
        }

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        let EORIssueReviewerFound = await EORIssueReviewer.findByPk(EORIssueReviewFound.eor_issue_reviewer_id);
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

        const uuid = uuidv4();
        const ext = path.extname(req.file.originalname);

        const newFileName = `${uuid}${ext}`;
        const finalPath = path.resolve(__dirname, uploadPath, newFileName);

        try {
            await fs.move(tempPath, finalPath);

            const EORIssueReviewAttachmentFoundCount = await EORIssueReviewAttachment.count({
                where: { eor_issue_review_id: EORIssueReviewFound.id }
            });
            const attachmentNumber = EORIssueReviewAttachmentFoundCount + 1;

            const savedFile = await EORIssueReviewAttachment.create({
                file_uuid: newFileName,
                title: title,
                mime_type: req.file.mimetype,
                description: description,
                eor_issue_review_id: EORIssueReviewFound.id,
                att_number: attachmentNumber
            });
            return res.status(201).json({
                status: true,
                message: 'EOR Issue Review Attachment file uploaded and saved successfully',
                data: savedFile,
            });
        } catch (err) {
            await fs.unlink(tempPath).catch(() => { });
            await fs.unlink(finalPath).catch(() => { });

            throw new Error('Error saving file: ', err)
        }
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Upload failed' });
    }
};

exports.getAllEORIssueReviewAttachment = async (req, res) => {
    try {
        const EORIssueReviewAttachmentsFound = await EORIssueReviewAttachment.findAll();
        res.status(200).json({
            status: true,
            message: 'EOR Issue Review Attachments retrieved successfully',
            data: EORIssueReviewAttachmentsFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Issue Review Attachments' });
    }
};

exports.getEORIssueReviewAttachmentById = async (req, res) => {
    try {
        const id = req.params.id;
        const attachment_number = req.params.attachment_number;

        const EORIssueReviewFound = await EORIssueReview.findByPk(id)
        if (!EORIssueReviewFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue Review not found' });
        }

        const EORIssueReviewAttachmentFound = await EORIssueReviewAttachment.findOne({
            where: {
                eor_issue_review_id: id,
                att_number: attachment_number,
            }
        });
        if (!EORIssueReviewAttachmentFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue Review Attachment not found' });
        }

        res.status(200).json({
            status: true,
            message: 'EOR Issue Review Attachment retrieved successfully',
            data: EORIssueReviewAttachmentFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Issue Review Attachment' });
    }
};

exports.updateEORIssueReviewAttachment = async (req, res) => {
    try {
        const id = req.params.id;
        const attachment_number = req.params.attachment_number;
        const { title, description } = req.body;
        const user_id = req.user.id;

        const EORIssueReviewFound = await EORIssueReview.findByPk(id)
        if (!EORIssueReviewFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue Review not found' });
        }

        const EORIssueReviewAttachmentFound = await EORIssueReviewAttachment.findOne({
            where: {
                eor_issue_review_id: id,
                att_number: attachment_number,
            }
        });
        if (!EORIssueReviewAttachmentFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue Review Attachment not found' });
        }

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        let EORIssueReviewerFound = await EORIssueReviewer.findByPk(EORIssueReviewFound.eor_issue_reviewer_id);
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

        EORIssueReviewAttachmentFound.title = title;
        EORIssueReviewAttachmentFound.description = description;

        await EORIssueReviewAttachmentFound.save();

        res.status(200).json({
            status: true,
            message: 'EOR Issue Review Attachment updated successfully',
            data: EORIssueReviewAttachmentFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error updating EOR Issue Review Attachment' });
    }
};

exports.deleteEORIssueReviewAttachment = async (req, res) => {
    try {
        const id = req.params.id;
        const attachment_number = req.params.attachment_number;
        const user_id = req.user.id;

        const EORIssueReviewAttachmentFound = await EORIssueReviewAttachment.findOne({
            where: {
                eor_issue_review_id: id,
                att_number: attachment_number,
            }
        });
        if (!EORIssueReviewAttachmentFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue Review Attachment not found' });
        }

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        const EORIssueReviewFound = await EORIssueReview.findByPk(EORIssueReviewAttachmentFound.eor_issue_review_id)
        let EORIssueReviewerFound = await EORIssueReviewer.findByPk(EORIssueReviewFound.eor_issue_reviewer_id);
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

        const fileName = EORIssueReviewAttachmentFound.file_uuid
        const finalPath = path.resolve(__dirname, uploadPath, fileName);

        await fs.unlink(finalPath).catch(() => { });

        await EORIssueReviewAttachmentFound.destroy();
        return res.status(200).json({ status: true, message: 'EOR Issue Review Attachment deleted successfully' });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error deleting EOR Issue Review Attachment' });
    }
};
