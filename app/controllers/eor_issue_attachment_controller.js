const { EORIssueAttachment, EORIssue, EOR, TOE, Reviewer, TOEReviewer } = require('../models');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

const uploadPath = "./../uploads/eor_issue_attachment"

exports.uploadFileEORIssueAttachment = async (req, res) => {
    try {
        const eor_issue_id = req.params.id;
        const { title, description } = req.body;
        const user_id = req.user.id;

        if (!req.file) {
            return res.status(400).json({ status: false, message: 'No file uploaded or invalid file type' });
        }

        const tempPath = req.file.path;

        const EORIssueFound = await EORIssue.findByPk(eor_issue_id);
        if (!EORIssueFound) {
            await fs.unlink(tempPath).catch(() => { });
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

        // const TOEFound = await TOE.findByPk(EORFound.toe_id);
        // const dateStr = new Date().toISOString().split('T')[0];
        // const work_package = EORFound.work_package;
        // const toe_title = TOEFound.title.replace(/\s+/g, '_').toLowerCase();
        const uuid = uuidv4();
        const ext = path.extname(req.file.originalname);

        const newFileName = `${uuid}${ext}`;
        const finalPath = path.resolve(__dirname, uploadPath, newFileName);

        try {
            await fs.move(tempPath, finalPath);
            const EORIssueAttachmentFoundMaxValue = await EORIssueAttachment.max('att_number', {
                where: { eor_issue_id: EORIssueFound.id }
            });

            const attachmentNumber = (isNaN(EORIssueAttachmentFoundMaxValue) ? 0 : EORIssueAttachmentFoundMaxValue + 1);

            const savedFile = await EORIssueAttachment.create({
                file_uuid: newFileName,
                title: title,
                mime_type: req.file.mimetype,
                description: description,
                eor_issue_id: EORIssueFound.id,
                att_number: attachmentNumber
            });
            return res.status(201).json({
                status: true,
                message: 'EOR Issue Attachment file uploaded and saved successfully',
                file: savedFile,
            });
        } catch (err) {
            await fs.unlink(tempPath).catch(() => { });
            await fs.unlink(finalPath).catch(() => { });
            throw new Error('Error saving file: ', err)
        }
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Upload failed: ' });
    }
};

exports.getAllEORIssueAttachment = async (req, res) => {
    try {
        const eor_issue_id = req.params.id;
        const EORIssueAttachmentsFound = await EORIssueAttachment.findAll(
            { where: { eor_issue_id: eor_issue_id } }
        );
        res.status(200).json({
            status: true,
            message: 'EOR Issue Attachments retrieved successfully',
            data: EORIssueAttachmentsFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Issue Attachments' });
    }
};

exports.getEORIssueAttachmentById = async (req, res) => {
    try {
        const id = req.params.id;
        const attachment_number = req.params.attachment_number;

        const EORIssueFound = await EORIssue.findByPk(id)
        if (!EORIssueFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue not found' });
        }

        const EORIssueAttachmentFound = await EORIssueAttachment.findOne({
            where: {
                eor_issue_id: id,
                att_number: attachment_number,
            }
        });
        if (!EORIssueAttachmentFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue Attachment not found' });
        }

        res.status(200).json({
            status: true,
            message: 'EOR Issue Attachment retrieved successfully',
            data: EORIssueAttachmentFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Issue Attachment' });
    }
};

exports.updateEORIssueAttachment = async (req, res) => {
    try {
        const id = req.params.id;
        const attachment_number = req.params.attachment_number;
        const { title, description } = req.body;
        const user_id = req.user.id;

        const EORIssueFound = await EORIssue.findByPk(id)
        if (!EORIssueFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue not found' });
        }

        const EORIssueAttachmentFound = await EORIssueAttachment.findOne({
            where: {
                eor_issue_id: id,
                att_number: attachment_number,
            }
        });
        if (!EORIssueAttachmentFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue Attachment not found' });
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

        EORIssueAttachmentFound.title = title;
        EORIssueAttachmentFound.description = description;

        await EORIssueAttachmentFound.save();

        res.status(200).json({
            status: true,
            message: 'EOR Issue Attachment updated successfully',
            data: EORIssueAttachmentFound,
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error updating EOR Issue Attachment' });
    }
};

exports.deleteEORIssueAttachment = async (req, res) => {
    try {
        const id = req.params.id;
        const attachment_number = req.params.attachment_number;
        const user_id = req.user.id;

        const EORIssueFound = await EORIssue.findByPk(id)
        if (!EORIssueFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue not found' });
        }

        const EORIssueAttachmentFound = await EORIssueAttachment.findOne({
            where: {
                eor_issue_id: id,
                att_number: attachment_number,
            }
        });
        if (!EORIssueAttachmentFound) {
            return res.status(404).json({ status: false, message: 'EOR Issue Attachment not found' });
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

        const fileName = EORIssueAttachmentFound.file_uuid
        const finalPath = path.resolve(__dirname, uploadPath, fileName);

        await fs.unlink(finalPath).catch(() => { });

        await EORIssueAttachmentFound.destroy();

        res.status(200).json({ status: true, message: 'EOR Issue Attachment deleted successfully' });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error deleting EOR Issue Attachment' });
    }
};
