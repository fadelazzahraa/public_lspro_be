const express = require('express');
const router = express.Router();
const EORController = require('../controllers/eor_controller');
const EORIssueController = require('../controllers/eor_issue_controller');
const EORScheduleController = require('../controllers/eor_schedule_controller');
const EORAnalysisController = require('../controllers/eor_analysis_controller');
const EORReviewReportController = require('../controllers/eor_reviewreport_controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, EORController.createEOR);
router.get('/', auth, EORController.getAllEOR);

router.get('/:id/issue', auth, EORIssueController.getAllEORIssueOfEORbyEORId);
router.get('/:id/schedule', auth, EORScheduleController.getEORScheduleByEORId);
router.get('/:id/analysis', auth, EORAnalysisController.getEORAnalysisByEORId);
router.get('/:id/summary', auth, EORController.getEORSummaryById);
router.get('/:id/review-report/', auth, EORReviewReportController.getRRByEORId);
router.post('/:id/review-report/', auth, EORReviewReportController.postRRByEORId);
router.delete('/:id/review-report/', auth, EORReviewReportController.deleteRRByEORId);
router.post('/:id/review-report/upload', auth, upload.single('file'), EORReviewReportController.postByUploadRRByEORId);
router.get('/:id/review-report/preview', auth, EORReviewReportController.getRRPreviewByEORId);
router.get('/:id/review-report/preview-pdf', auth, EORReviewReportController.getRRPDFPreviewByEORId);
router.get('/:id/review-report/preview-pdfs', EORReviewReportController.getRRPDFPreview2ByEORId);
router.post('/:id/review-report/sign', auth, upload.single('file'), EORReviewReportController.uploadAndSignRRByEORId);

router.get('/:id', auth, EORController.getEORById);
router.post('/:id', auth, EORController.updateEOR);
router.delete('/:id', auth, EORController.deleteEOR);

module.exports = router;
