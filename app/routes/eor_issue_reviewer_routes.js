const express = require('express');
const router = express.Router();
const EORIssueReviewerController = require('../controllers/eor_issue_reviewer_controller');
const auth = require('../middleware/auth');

router.post('/', auth, EORIssueReviewerController.createEORIssueReviewer);
router.get('/', auth, EORIssueReviewerController.getAllEORIssueReviewer);
router.get('/:id', auth, EORIssueReviewerController.getEORIssueReviewerById);
router.post('/:id', auth, EORIssueReviewerController.updateEORIssueReviewer);
router.delete('/:id', auth, EORIssueReviewerController.deleteEORIssueReviewer);

module.exports = router;
