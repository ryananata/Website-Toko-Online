const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ✅ Endpoint untuk autentikasi
router.post('/register', userController.register);
router.post('/login', userController.login);

// ✅ CRUD user (tanpa createUser, cukup pakai register)
router.get('/', userController.getAllUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
