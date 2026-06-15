const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const checkToken = require('../helpers/check-token');
const { authLimiter, apiLimiter } = require('../middlewares/rateLimiter');

// Rotas públicas com rate limit restritivo
router.post('/register', authLimiter, AdminController.createAdmin);
router.post('/login', authLimiter, AdminController.loginAdmin);

// Rotas protegidas: primeiro apiLimiter, depois checkToken
router.get('/dashboard', apiLimiter, checkToken, AdminController.getDashboardStats);
router.get('/', apiLimiter, checkToken, AdminController.getAllAdmins);
router.get('/:id', apiLimiter, checkToken, AdminController.getAdminById);
router.put('/:id', apiLimiter, checkToken, AdminController.updateAdmin);
router.put('/:id/password', apiLimiter, checkToken, AdminController.updatePassword);
router.put('/:id/permissions', apiLimiter, checkToken, AdminController.updatePermissions);
router.patch('/:id/toggle-status', apiLimiter, checkToken, AdminController.toggleAdminStatus);
router.delete('/:id', apiLimiter, checkToken, AdminController.deleteAdmin);

module.exports = router;
