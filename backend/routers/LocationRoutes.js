const router = require('express').Router()
const LocationController = require('../controllers/LocationController')
const verifyToken = require('../helpers/verifyToken')
const { standardLimiter } = require('../middlewares/rateLimiter')

router.post('/', standardLimiter, verifyToken, LocationController.create)
router.get('/', standardLimiter, verifyToken, LocationController.getAll)
router.get('/nearby', standardLimiter, verifyToken, LocationController.getNearby)
router.get('/:id', standardLimiter, verifyToken, LocationController.getById)
router.get('/pet/:petId', standardLimiter, verifyToken, LocationController.getByPetId)
router.put('/:id', standardLimiter, verifyToken, LocationController.update)
router.delete('/:id', standardLimiter, verifyToken, LocationController.delete)

module.exports = router