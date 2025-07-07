const express = require('express');
const router = express.Router();
const EORIssueController = require('../controllers/eor_issue_controller');
const EORIssueAttachmentController = require('../controllers/eor_issue_attachment_controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, EORIssueController.createEORIssue);
router.get('/', auth, EORIssueController.getAllEORIssue);

router.post('/:id/attachment', auth, upload.single('file'), EORIssueAttachmentController.uploadFileEORIssueAttachment);
router.get('/:id/attachment', auth, EORIssueAttachmentController.getAllEORIssueAttachment);

router.get('/:id/attachment/:attachment_number', auth, EORIssueAttachmentController.getEORIssueAttachmentById);
router.post('/:id/attachment/:attachment_number', auth, EORIssueAttachmentController.updateEORIssueAttachment);
router.delete('/:id/attachment/:attachment_number', auth, EORIssueAttachmentController.deleteEORIssueAttachment);

router.get('/:id', auth, EORIssueController.getEORIssueById);
router.post('/:id', auth, EORIssueController.updateEORIssue);
router.delete('/:id', auth, EORIssueController.deleteEORIssue);

module.exports = router;
