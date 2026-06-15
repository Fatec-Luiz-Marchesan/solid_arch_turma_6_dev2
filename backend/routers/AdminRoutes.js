const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const verifyToken = require('../helpers/check-token');
const { authLimiter, apiLimiter, strictLimiter } = require('../middlewares/rateLimiter');
const cacheMiddleware = require('../middlewares/cacheMiddleware');

// Rotas públicas com rate limit restritivo
router.post('/register', authLimiter, AdminController.createAdmin);
router.post('/login', authLimiter, AdminController.loginAdmin);

// Rotas protegidas com rate limit e cache (Task 33)
router.get('/all', apiLimiter, verifyToken, cacheMiddleware, AdminController.getAllAdmins);
router.get('/stats', apiLimiter, verifyToken, AdminController.getDashboardStats);
router.get('/:id', apiLimiter, verifyToken, AdminController.getAdminById);
router.put('/:id', apiLimiter, verifyToken, AdminController.updateAdmin);
router.put('/:id/password', strictLimiter, verifyToken, AdminController.updatePassword);
router.patch('/:id/status', apiLimiter, verifyToken, AdminController.toggleAdminStatus);
router.patch('/:id/permissions', apiLimiter, verifyToken, AdminController.updatePermissions);
router.delete('/:id', strictLimiter, verifyToken, AdminController.deleteAdmin);
router.delete('/cache/clear', apiLimiter, verifyToken, AdminController.clearCache);

module.exports = router;
