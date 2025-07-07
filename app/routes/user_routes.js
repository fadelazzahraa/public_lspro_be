const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user_controller');
const auth = require('../middleware/auth');

router.post('/', UserController.createUser);
router.get('/', auth, UserController.getAllUsers);

router.post('/password', auth, UserController.changePassword);
router.post('/email', auth, UserController.changeEmail);

router.get('/:id', auth, UserController.getUserById);
router.post('/:id', auth, UserController.updateUser);
router.delete('/:id', auth, UserController.deleteUser);


module.exports = router;
