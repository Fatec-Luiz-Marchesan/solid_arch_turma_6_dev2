const router = require('express').Router()
const AdminController = require('../controllers/AdminController')
const verifyToken = require('../helpers/check-token')
const { authLimiter, standardLimiter, strictLimiter } = require('../middlewares/rateLimiter')
const cacheMiddleware = require('../middlewares/cacheMiddleware')

router.post('/register', authLimiter, AdminController.createAdmin)
router.post('/login', authLimiter, AdminController.loginAdmin)
router.get('/all', standardLimiter, verifyToken, cacheMiddleware, AdminController.getAllAdmins)
router.get('/stats', standardLimiter, verifyToken, AdminController.getDashboardStats)
router.get('/:id', standardLimiter, verifyToken, AdminController.getAdminById)
router.put('/:id', standardLimiter, verifyToken, AdminController.updateAdmin)
router.put('/:id/password', strictLimiter, verifyToken, AdminController.updatePassword)
router.patch('/:id/status', standardLimiter, verifyToken, AdminController.toggleAdminStatus)
router.patch('/:id/permissions', standardLimiter, verifyToken, AdminController.updatePermissions)
router.delete('/:id', strictLimiter, verifyToken, AdminController.deleteAdmin)
router.delete('/cache/clear', standardLimiter, verifyToken, AdminController.clearCache)

module.exports = router