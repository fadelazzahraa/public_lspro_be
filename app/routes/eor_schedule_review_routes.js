const express = require('express');
const router = express.Router();
const EORScheduleReviewController = require('../controllers/eor_schedule_review_controller');
const auth = require('../middleware/auth');

router.post('/', auth, EORScheduleReviewController.createEORScheduleReview);
router.get('/', auth, EORScheduleReviewController.getAllEORScheduleReview);
router.get('/:id', auth, EORScheduleReviewController.getEORScheduleReviewById);
router.post('/:id', auth, EORScheduleReviewController.updateEORScheduleReview);
router.delete('/:id', auth, EORScheduleReviewController.deleteEORScheduleReview);

module.exports = router;
