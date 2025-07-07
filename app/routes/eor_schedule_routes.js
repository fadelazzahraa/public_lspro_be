const express = require('express');
const router = express.Router();
const EORScheduleController = require('../controllers/eor_schedule_controller');
const auth = require('../middleware/auth');

router.post('/', auth, EORScheduleController.createEORSchedule);
router.get('/', auth, EORScheduleController.getAllEORSchedule);
router.get('/:id', auth, EORScheduleController.getEORScheduleById);
router.post('/:id', auth, EORScheduleController.updateEORSchedule);
router.delete('/:id', auth, EORScheduleController.deleteEORSchedule);

module.exports = router;
