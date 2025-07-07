const express = require('express');
const router = express.Router();
const EORIssueReviewController = require('../controllers/eor_issue_review_controller');
const EORIssueReviewAttachmentController = require('../controllers/eor_issue_review_attachment_controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, EORIssueReviewController.createEORIssueReview);
router.get('/', auth, EORIssueReviewController.getAllEORIssueReview);

router.post('/:id/attachment', auth, upload.single('file'), EORIssueReviewAttachmentController.uploadFileEORIssueReviewAttachment);
router.get('/:id/attachment', auth, EORIssueReviewAttachmentController.getAllEORIssueReviewAttachment);

router.get('/:id/attachment/:attachment_number', auth, EORIssueReviewAttachmentController.getEORIssueReviewAttachmentById);
router.post('/:id/attachment/:attachment_number', auth, EORIssueReviewAttachmentController.updateEORIssueReviewAttachment);
router.delete('/:id/attachment/:attachment_number', auth, EORIssueReviewAttachmentController.deleteEORIssueReviewAttachment);

router.get('/:id', auth, EORIssueReviewController.getEORIssueReviewById);
router.post('/:id', auth, EORIssueReviewController.updateEORIssueReview);
router.delete('/:id', auth, EORIssueReviewController.deleteEORIssueReview);

module.exports = router;
