const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const checkToken = require('../helpers/check-token');
const { authLimiter, apiLimiter, strictLimiter } = require('../middlewares/rateLimiter');

// Rotas públicas com rate limit mais restritivo
router.post('/register', authLimiter, AdminController.createAdmin);
router.post('/login', authLimiter, AdminController.loginAdmin);

// Rotas protegidas com rate limit padrão
router.get('/dashboard', apiLimiter, checkToken, AdminController.getDashboardStats);
router.get('/', apiLimiter, checkToken, AdminController.getAllAdmins);
router.get('/:id', apiLimiter, checkToken, AdminController.getAdminById);
router.put('/:id', apiLimiter, checkToken, AdminController.updateAdmin);
router.put('/:id/password', strictLimiter, checkToken, AdminController.updatePassword);
router.put('/:id/permissions', apiLimiter, checkToken, AdminController.updatePermissions);
router.patch('/:id/toggle-status', apiLimiter, checkToken, AdminController.toggleAdminStatus);
router.delete('/:id', strictLimiter, checkToken, AdminController.deleteAdmin);

module.exports = router;
