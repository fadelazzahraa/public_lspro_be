const express = require('express');
const router = express.Router();
const ReviewerController = require('../controllers/reviewer_controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, ReviewerController.createReviewer);
router.get('/', auth, ReviewerController.getAllReviewers);

// ! DEBUG
router.post('/change-data', auth, ReviewerController.changeReviewerData);

router.post('/:id/speciment', auth, upload.single('file'), ReviewerController.uploadSpeciments);

router.get('/:id', auth, ReviewerController.getReviewerById);
router.post('/:id', auth, ReviewerController.updateReviewer);
router.delete('/:id', auth, ReviewerController.deleteReviewer);

module.exports = router;
