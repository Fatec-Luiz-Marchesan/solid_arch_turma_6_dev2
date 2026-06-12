const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const checkToken = require('../helpers/check-token');

router.post('/register', AdminController.createAdmin);
router.post('/login', AdminController.loginAdmin);
router.get('/dashboard', checkToken, AdminController.getDashboardStats);
router.get('/', checkToken, AdminController.getAllAdmins);
router.get('/:id', checkToken, AdminController.getAdminById);
router.put('/:id', checkToken, AdminController.updateAdmin);
router.put('/:id/password', checkToken, AdminController.updatePassword);
router.put('/:id/permissions', checkToken, AdminController.updatePermissions);
router.patch('/:id/toggle-status', checkToken, AdminController.toggleAdminStatus);
router.delete('/:id', checkToken, AdminController.deleteAdmin);

module.exports = router;
