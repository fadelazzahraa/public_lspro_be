const express = require('express');
const router = express.Router();
const EORAnalysisController = require('../controllers/eor_analysis_controller');
const auth = require('../middleware/auth');

router.post('/', auth, EORAnalysisController.createEORAnalysis);
router.get('/', auth, EORAnalysisController.getAllEORAnalysis);
router.get('/:id', auth, EORAnalysisController.getEORAnalysisById);
router.post('/:id', auth, EORAnalysisController.updateEORAnalysis);
router.delete('/:id', auth, EORAnalysisController.deleteEORAnalysis);

module.exports = router;
