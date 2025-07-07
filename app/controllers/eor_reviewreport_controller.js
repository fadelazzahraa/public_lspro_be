const { TOE, EOR, Reviewer, TOEReviewer, EORReviewReport } = require('../models');
const { getEORSummaryByEORId, generateRRWordDocument, generateRRPDFDocument, generateRRReviewPDFDocument, formatDateWithSuperscript, formatTanggalIndo } = require('../helpers/review_report');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');

const path = require('path');
const { where } = require('sequelize');

const manajerTeknisReviewerId = 10;
const katimSertifikasiReviewerId = 2;

exports.getRRByEORId = async (req, res) => {
    try {
        const eor_id = req.params.id;

        const EORReviewReportFound = await EORReviewReport.findOne({ where: { eor_id: eor_id } });
        if (!EORReviewReportFound) {
            return res.status(404).json({ status: false, message: 'EOR Review Report not found for this EOR' });
        }

        res.status(200).json({
            status: true,
            message: 'EOR Review Report found',
            data: EORReviewReportFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Review Report' });
    };
}

exports.getRRPreviewByEORId = async (req, res) => {
    try {
        const eor_id = req.params.id;
        const user_id = req.user.id;

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }
        const EORFound = await EOR.findByPk(eor_id);
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

        const data = await getEORSummaryByEORId(eor_id)

        if (!data) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }

        data.no = "00000"
        data.rev = "0"
        data.tanggal = formatTanggalIndo("2000-01-01")
        data.date = formatDateWithSuperscript("2000-01-01")
        data.meeting_decision = true
        data.location = "Jakarta"
        data.left_signer = null
        data.middle_signer = null
        data.right_signer = [null]

        const result = await generateRRWordDocument(data);

        if (!result) {
            return res.status(500).json({ status: false, message: "Failed generating document" });
        }

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${result.filename}"`
        );
        res.setHeader('Content-Type', result.mimeType);
        res.send(result.buffer);
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, message: "Internal server error" });
    }
}

exports.getRRPDFPreviewByEORId = async (req, res) => {
    try {
        const eor_id = req.params.id;
        const user_id = req.user.id;

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        const EORFound = await EOR.findByPk(eor_id);
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

        const data = await getEORSummaryByEORId(eor_id)

        if (!data) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }

        data.no = "00000"
        data.rev = "0"
        data.tanggal = formatTanggalIndo("2000-01-01")
        data.date = formatDateWithSuperscript("2000-01-01")
        data.meeting_decision = true
        data.location = "Jakarta"
        data.left_signer = null
        data.middle_signer = null
        data.right_signer = [null]

        const result = await generateRRWordDocument(data);

        if (!result) {
            return res.status(500).json({ status: false, message: "Failed generating document" });
        }

        const result2 = await generateRRReviewPDFDocument(result.buffer)

        if (!result2) {
            throw new Error("File PDF gagal dibuat")
        }

        res.status(201).json({ status: true, message: "EOR Review Report PDF preview generated successfully", data: { file_uuid: result2.filename } })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, message: "Internal server error" });
    }
}

exports.getRRPDFPreview2ByEORId = async (req, res) => {
    try {
        const eor_id = req.params.id;

        const data = await getEORSummaryByEORId(eor_id)

        if (!data) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }

        data.no = "00000"
        data.rev = "0"
        data.tanggal = formatTanggalIndo("2000-01-01")
        data.date = formatDateWithSuperscript("2000-01-01")
        data.meeting_decision = true
        data.location = "Jakarta"
        data.left_signer = null
        data.middle_signer = null
        data.right_signer = [null]

        const result = await generateRRWordDocument(data);

        if (!result) {
            return res.status(500).json({ status: false, message: "Failed generating document" });
        }

        const result2 = await generateRRReviewPDFDocument(result.buffer)

        if (!result2) {
            throw new Error("File PDF gagal dibuat")
        }

        res.setHeader(
            'Content-Disposition',
            `inline; filename="${result2.filename}"`
        );
        res.setHeader('Content-Type', result2.mimeType);
        res.send(result2.buffer);

    } catch (err) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
}

exports.postRRByEORId = async (req, res) => {
    try {
        const eor_id = req.params.id;
        const {
            rr_no,
            rr_rev,
            rr_date,
            rr_meeting_decision,
            rr_location,
        } = req.body;
        const user_id = req.user.id;

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        const EORFound = await EOR.findByPk(eor_id);
        if (!EORFound) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }
        const TOEFound = await TOE.findByPk(EORFound.toe_id, {
            include: [
                {
                    model: Reviewer,
                    through: {
                        attributes: ['is_lead_reviewer', 'is_active']
                    }
                },
            ],
        });
        const TOEReviewerFound = await TOEReviewer.findOne({
            where: {
                toe_id: TOEFound.id,
                reviewer_id: ReviewerFound.id,
            }
        });
        if (!TOEReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your Reviewer not assigned as TOE Reviewer for TOE of this EOR Issue' });
        }
        if (!TOEReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your TOE Reviewer is not active' });
        }
        const MiddleSignerReviewerFound = await Reviewer.findByPk(manajerTeknisReviewerId);
        const LeftSignerReviewerFound = await Reviewer.findByPk(katimSertifikasiReviewerId);

        const transformedReviewers = TOEFound.reviewers
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

        const responseTOE = TOEFound.toJSON();
        responseTOE.reviewers = transformedReviewers;


        const data = await getEORSummaryByEORId(eor_id)

        if (!data) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }

        data.no = rr_no
        data.rev = rr_rev
        data.tanggal = formatTanggalIndo(rr_date)
        data.date = formatDateWithSuperscript(rr_date)
        data.meeting_decision = rr_meeting_decision
        data.location = rr_location
        data.left_signer = {
            name: LeftSignerReviewerFound.name,
            file_uuid: LeftSignerReviewerFound.speciment_file_uuid
        }
        data.middle_signer = {
            name: MiddleSignerReviewerFound.name,
            file_uuid: MiddleSignerReviewerFound.speciment_file_uuid
        }
        data.right_signer = responseTOE.reviewers
            .map(r => ({
                name: r.name,
                file_uuid: r.speciment_file_uuid,
                is_lead: r.toe_reviewer_is_lead_reviewer === true
            }))
            .sort((a, b) => a.is_lead - b.is_lead) // false (0) duluan, true (1) di akhir
            .map(({ name, file_uuid }) => ({ name, file_uuid }))

        const result = await generateRRWordDocument(data);

        if (!result) {
            return res.status(500).json({ status: false, message: "Failed generating document" });
        } else {
            res.status(200).json({
                status: true,
                message: "DOCX berhasil dibuat, PDF akan diproses di background."
            });
        }

        const result2 = await generateRRPDFDocument(result.buffer)

        if (!result2) {
            throw new Error("File PDF gagal dibuat")
        }

        const LeadRightSignerReviewerFound = responseTOE.reviewers.find(r => r.toe_reviewer_is_lead_reviewer === true);

        const newEORReviewReport = await EORReviewReport.create({
            eor_id: eor_id,
            file: [
                {
                    id: 0,
                    file_uuid: result2.filename,
                    date: new Date(),
                    signer_reviewer_id: -1
                }
            ],
            left_signer: {
                id: LeftSignerReviewerFound.id,
                name: LeftSignerReviewerFound.name,
                has_sign: false,
                file_id: null,
            },
            middle_signer: {
                id: MiddleSignerReviewerFound.id,
                name: MiddleSignerReviewerFound.name,
                has_sign: false,
                file_id: null,
            },
            lead_right_signer: {
                id: LeadRightSignerReviewerFound.id,
                name: LeadRightSignerReviewerFound.name,
                has_sign: false,
                file_id: null
            },
            right_signer: responseTOE.reviewers
                .filter(r => r.toe_reviewer_is_lead_reviewer !== true)
                .map(r => ({
                    id: r.id,
                    name: r.name,
                    has_sign: false,
                    file_id: null,
                }))
        });

        console.log("Done creating EOR Review Report");

    } catch (err) {
        console.log(err)
        if (!res.headersSent) {
            res.status(500).json({ status: false, message: "Internal server error" });
        }
    }

}
exports.postByUploadRRByEORId = async (req, res) => {
    try {
        const eor_id = req.params.id;
        const user_id = req.user.id;

        if (!req.file) {
            return res.status(400).json({ status: false, message: 'No file uploaded or invalid file type' });
        } else if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ status: false, message: 'Invalid file type. Only PDF is allowed' });
        }
        const tempPath = req.file.path;

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        const EORFound = await EOR.findByPk(eor_id);
        if (!EORFound) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }
        const TOEFound = await TOE.findByPk(EORFound.toe_id, {
            include: [
                {
                    model: Reviewer,
                    through: {
                        attributes: ['is_lead_reviewer', 'is_active']
                    }
                },
            ],
        });
        const TOEReviewerFound = await TOEReviewer.findOne({
            where: {
                toe_id: TOEFound.id,
                reviewer_id: ReviewerFound.id,
            }
        });
        if (!TOEReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your Reviewer not assigned as TOE Reviewer for TOE of this EOR Issue' });
        }
        if (!TOEReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your TOE Reviewer is not active' });
        }

        const uuid = uuidv4();
        const newFileName = `${uuid}.pdf`;
        const finalPath = path.resolve(__dirname, '../reviewreports/', newFileName);

        try {
            await fs.move(tempPath, finalPath);

            const transformedReviewers = TOEFound.reviewers
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

            const responseTOE = TOEFound.toJSON();
            responseTOE.reviewers = transformedReviewers;

            const LeftSignerReviewerFound = await Reviewer.findByPk(katimSertifikasiReviewerId);
            const MiddleSignerReviewerFound = await Reviewer.findByPk(manajerTeknisReviewerId);
            const LeadRightSignerReviewerFound = responseTOE.reviewers.find(r => r.toe_reviewer_is_lead_reviewer === true);

            const newEORReviewReport = await EORReviewReport.create({
                eor_id: eor_id,
                file: [
                    {
                        id: 0,
                        file_uuid: newFileName,
                        date: new Date(),
                        signer_reviewer_id: -1
                    }
                ],
                left_signer: {
                    id: LeftSignerReviewerFound.id,
                    name: LeftSignerReviewerFound.name,
                    has_sign: false,
                    file_id: null,
                },
                middle_signer: {
                    id: MiddleSignerReviewerFound.id,
                    name: MiddleSignerReviewerFound.name,
                    has_sign: false,
                    file_id: null,
                },
                lead_right_signer: {
                    id: LeadRightSignerReviewerFound.id,
                    name: LeadRightSignerReviewerFound.name,
                    has_sign: false,
                    file_id: null
                },
                right_signer: responseTOE.reviewers
                    .filter(r => r.toe_reviewer_is_lead_reviewer !== true)
                    .map(r => ({
                        id: r.id,
                        name: r.name,
                        has_sign: false,
                        file_id: null,
                    }))

            });
            return res.status(201).json({
                status: true,
                message: 'Review Report File uploaded and saved successfully',
                data: newEORReviewReport,
            });
        } catch (err) {
            await fs.unlink(tempPath).catch(() => { });
            await fs.unlink(finalPath).catch(() => { });
            throw new Error('Error saving file: ', err)
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: 'Upload failed' });
    }

}

exports.uploadRRByEORId = async (req, res) => {
    try {
        const eor_id = req.params.id;
        const user_id = req.user.id;

        if (!req.file) {
            return res.status(400).json({ status: false, message: 'No file uploaded or invalid file type' });
        } else if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ status: false, message: 'Invalid file type. Only PDF is allowed' });
        }
        const tempPath = req.file.path;

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User are not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        const EORFound = await EOR.findByPk(eor_id);
        if (!EORFound) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }
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
        xxa
        const uuid = uuidv4();
        const newFileName = `${uuid}.pdf`;
        const finalPath = path.resolve(__dirname, '../reviewreports/', newFileName);

        try {
            await fs.move(tempPath, finalPath);

            const newEORReviewReport = await EORReviewReport.create({
                eor_id: eor_id,
                file_uuid: newFileName,
                left_signer_reviewer_id: 1,
                right_signer_reviewer_id: 2
            });
            return res.status(201).json({
                status: true,
                message: 'Review Report File uploaded and saved successfully',
                data: newEORReviewReport,
            });
        } catch (err) {
            await fs.unlink(tempPath).catch(() => { });
            await fs.unlink(finalPath).catch(() => { });
            throw new Error('Error saving file: ', err)
        }

    } catch (err) {
        return res.status(500).json({ status: false, message: 'Upload failed' });
    }
}

exports.uploadAndSignRRByEORId = async (req, res) => {
    try {
        const eor_id = req.params.id;
        const user_id = req.user.id;

        if (!req.file) {
            return res.status(400).json({ status: false, message: 'No file uploaded or invalid file type' });
        } else if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ status: false, message: 'Invalid file type. Only PDF is allowed' });
        }

        const tempPath = req.file.path;
        const uuid = uuidv4();
        const newFileName = `${uuid}.pdf`;
        const finalPath = path.resolve(__dirname, '../reviewreports/', newFileName);

        const ReviewerFound = await Reviewer.findOne({ where: { user_id: user_id } });
        if (!ReviewerFound) {
            return res.status(404).json({ status: false, message: 'Your User is not assigned to a Reviewer' });
        }
        if (!ReviewerFound.is_active) {
            return res.status(400).json({ status: false, message: 'Your Reviewer is not active' });
        }

        let EORReviewReportFound = await EORReviewReport.findOne({ where: { eor_id: eor_id } });
        if (!EORReviewReportFound) {
            return res.status(404).json({ status: false, message: 'Review Report not found' });
        }

        const reviewerId = ReviewerFound.id;

        let signerRole = null;
        const signedRightInIndex = EORReviewReportFound.right_signer.findIndex(r => r.id === reviewerId); // -1 or 0, 1, 2, etc
        const signedRight = signedRightInIndex !== -1;
        const signedLeadRight = EORReviewReportFound.lead_right_signer.id === reviewerId; // true or false
        const signedMiddle = EORReviewReportFound.middle_signer.id === reviewerId; // true or false
        const signedLeft = EORReviewReportFound.left_signer.id === reviewerId; // true or false

        if (signedRight && !signedLeadRight && !signedMiddle && !signedLeft) signerRole = 'right';
        else if (!signedRight && signedLeadRight && !signedMiddle && !signedLeft) signerRole = 'lead_right';
        else if (!signedRight && !signedLeadRight && signedMiddle && !signedLeft) signerRole = 'middle';
        else if (!signedRight && !signedLeadRight && !signedMiddle && signedLeft) signerRole = 'left';

        if (!signerRole) {
            return res.status(403).json({ status: false, message: 'You are not assigned as signer of this Review Report' });
        }

        if (signerRole === 'right') {
            console.log('has_sign: ', EORReviewReportFound.right_signer[signedRightInIndex])
            if (EORReviewReportFound.right_signer[signedRightInIndex].has_sign) {
                return res.status(400).json({ status: false, message: 'You have already signed this Review Report' });
            }
        }
        else if (signerRole === 'lead_right') {
            if (EORReviewReportFound.lead_right_signer.has_sign) {
                return res.status(400).json({ status: false, message: 'You have already signed this Review Report' });
            }

            const allRightSigned = EORReviewReportFound.right_signer.every(r => r.has_sign === true);
            if (!allRightSigned) {
                return res.status(400).json({ status: false, message: 'All Right Signers must sign before Lead Right Signer' });
            }
        }
        else if (signerRole === 'middle') {
            if (EORReviewReportFound.middle_signer.has_sign) {
                return res.status(400).json({ status: false, message: 'You have already signed this Review Report' });
            }

            const allRightSigned = EORReviewReportFound.right_signer.every(r => r.has_sign === true);
            if (!allRightSigned) {
                return res.status(400).json({ status: false, message: 'All Right Signers must sign before Middle Signer' });
            }
            const leadRightSigned = EORReviewReportFound.lead_right_signer.has_sign;
            if (!leadRightSigned) {
                return res.status(400).json({ status: false, message: 'Lead Right Signer must sign before Middle Signer' });
            }
        }
        else if (signerRole === 'left') {
            if (EORReviewReportFound.left_signer.has_sign) {
                return res.status(400).json({ status: false, message: 'You have already signed this Review Report' });
            }

            const allRightSigned = EORReviewReportFound.right_signer.every(r => r.has_sign === true);
            if (!allRightSigned) {
                return res.status(400).json({ status: false, message: 'All Right Signers must sign before Left Signer' });
            }
            const leadRightSigned = EORReviewReportFound.lead_right_signer.has_sign;
            if (!leadRightSigned) {
                return res.status(400).json({ status: false, message: 'Lead Right Signer must sign before Left Signer' });
            }
            const middleRightSigned = EORReviewReportFound.middle_signer.has_sign;
            if (!middleRightSigned) {
                return res.status(400).json({ status: false, message: 'Middle Signer must sign before Left Signer' });
            }
        }

        try {
            await fs.move(tempPath, finalPath);
        } catch (err) {
            await fs.unlink(tempPath).catch(() => { });
            return res.status(500).json({ status: false, message: 'Error saving file' });
        }

        const nextFileId = EORReviewReportFound.file.length > 0
            ? Math.max(...EORReviewReportFound.file.map(f => f.id || 0)) + 1
            : 0;

        const updatePayload = {}
        let signer_reviewer_id = -1;

        if (signerRole === 'right') {
            signer_reviewer_id = EORReviewReportFound.right_signer[signedRightInIndex].id;
            EORReviewReportFound.right_signer[signedRightInIndex].has_sign = true;
            EORReviewReportFound.right_signer[signedRightInIndex].file_id = nextFileId;
            updatePayload.right_signer = EORReviewReportFound.right_signer
        } else if (signerRole === 'lead_right') {
            signer_reviewer_id = EORReviewReportFound.lead_right_signer.id;
            EORReviewReportFound.lead_right_signer.has_sign = true;
            EORReviewReportFound.lead_right_signer.file_id = nextFileId;
            updatePayload.lead_right_signer = EORReviewReportFound.lead_right_signer
        } else if (signerRole === 'middle') {
            signer_reviewer_id = EORReviewReportFound.middle_signer.id;
            EORReviewReportFound.middle_signer.has_sign = true;
            EORReviewReportFound.middle_signer.file_id = nextFileId;
            updatePayload.middle_signer = EORReviewReportFound.middle_signer
        } else if (signerRole === 'left') {
            signer_reviewer_id = EORReviewReportFound.left_signer.id;
            EORReviewReportFound.left_signer.has_sign = true;
            EORReviewReportFound.left_signer.file_id = nextFileId;
            updatePayload.left_signer = EORReviewReportFound.left_signer
        }

        EORReviewReportFound.file.push({
            id: nextFileId,
            file_uuid: newFileName,
            date: new Date(),
            signer_reviewer_id: signer_reviewer_id,
        });

        updatePayload.file = EORReviewReportFound.file

        console.log("changed? ", EORReviewReportFound.changed());
        await EORReviewReport.update(updatePayload, {
            where: { eor_id: eor_id }
        });

        res.status(201).json({
            status: true,
            message: `Review Report signed successfully as ${signerRole.replace('_', ' ')} signer`,
            data: EORReviewReportFound
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, message: 'Error signing EOR Review Report' });
    }
};


exports.deleteRRByEORId = async (req, res) => {
    try {
        const eor_id = req.params.id;

        const EORFound = await EOR.findByPk(eor_id)
        if (!EORFound) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }

        const EORReviewReportFound = await EORReviewReport.findOne({
            where: {
                eor_id: eor_id
            }
        })
        if (!EORReviewReportFound) {
            return res.status(404).json({ status: false, message: 'No EOR Review Report yet' });
        }

        for (const fileEntry of EORReviewReportFound.file) {
            const fileName = fileEntry.file_uuid;
            if (fileName) {
                const finalPath = path.resolve(__dirname, '../reviewreports', fileName);
                try {
                    await fs.unlink(finalPath);
                    console.log(`File ${fileName} berhasil dihapus`);
                } catch (err) {
                    console.warn(`File ${fileName} gagal dihapus atau tidak ditemukan`);
                }
            }
        }

        await EORReviewReportFound.destroy();

        res.status(200).json({
            status: true,
            message: 'EOR Review Report deleted successfully'
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, message: "Internal server error" });
    }

}