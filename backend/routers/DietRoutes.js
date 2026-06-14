const router = require('express').Router()
const DietController = require('../controllers/DietController')
const verifyToken = require('../helpers/verifyToken')
const { standardLimiter } = require('../middlewares/rateLimiter')

router.post('/', standardLimiter, verifyToken, DietController.create)
router.get('/', standardLimiter, verifyToken, DietController.getAll)
router.get('/:id', standardLimiter, verifyToken, DietController.getById)
router.get('/pet/:petId', standardLimiter, verifyToken, DietController.getByPetId)
router.put('/:id', standardLimiter, verifyToken, DietController.update)
router.delete('/:id', standardLimiter, verifyToken, DietController.delete)

module.exports = router