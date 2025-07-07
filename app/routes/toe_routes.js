const express = require('express');
const router = express.Router();
const TOEController = require('../controllers/toe_controller');
const auth = require('../middleware/auth');

router.post('/', auth, TOEController.createTOE);
router.get('/', auth, TOEController.getAllTOE);

router.get('/:id/eor', auth, TOEController.getEOROfTOEById);

router.get('/:id', auth, TOEController.getTOEById);
router.post('/:id', auth, TOEController.updateTOE);
router.delete('/:id', auth, TOEController.deleteTOE);

module.exports = router;
