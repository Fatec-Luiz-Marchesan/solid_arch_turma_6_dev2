const router = require('express').Router()
const AdminController = require('../controllers/AdminController')
const verifyToken = require('../helpers/check-token')

router.post('/register', AdminController.createAdmin)
router.post('/login', AdminController.loginAdmin)

router.get('/all', verifyToken, AdminController.getAllAdmins)
router.get('/stats', verifyToken, AdminController.getDashboardStats)
router.get('/:id', verifyToken, AdminController.getAdminById)
router.put('/:id', verifyToken, AdminController.updateAdmin)
router.put('/:id/password', verifyToken, AdminController.updatePassword)
router.patch('/:id/status', verifyToken, AdminController.toggleAdminStatus)
router.patch('/:id/permissions', verifyToken, AdminController.updatePermissions)
router.delete('/:id', verifyToken, AdminController.deleteAdmin)

module.exports = router
