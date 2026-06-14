const router = require('express').Router()
const MessageController = require('../controllers/MessageController')
const verifyToken = require('../helpers/verifyToken')
const { standardLimiter } = require('../middlewares/rateLimiter')

router.post('/', standardLimiter, verifyToken, MessageController.create)
router.get('/:id', standardLimiter, verifyToken, MessageController.getById)
router.get('/conversation/:userId1/:userId2', standardLimiter, verifyToken, MessageController.getConversation)
router.get('/unread/:userId', standardLimiter, verifyToken, MessageController.getUnreadCount)
router.patch('/:id/read', standardLimiter, verifyToken, MessageController.markAsRead)
router.patch('/:id/delete/:userId', standardLimiter, verifyToken, MessageController.deleteForUser)
router.delete('/:id', standardLimiter, verifyToken, MessageController.delete)

module.exports = router