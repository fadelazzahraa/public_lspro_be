const express = require('express');
const router = express.Router();
const TOEReviewerController = require('../controllers/toe_reviewer_controller');
const auth = require('../middleware/auth');

router.post('/', auth, TOEReviewerController.createTOEReviewer);
router.get('/', auth, TOEReviewerController.getAllTOEReviewer);
router.delete('/', auth, TOEReviewerController.deleteTOEReviewerByTOEIdAndReviewerId);

module.exports = router;
