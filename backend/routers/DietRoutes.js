const router = require('express').Router()
const DietController = require('../controllers/DietController')
const verifyToken = require('../helpers/verifyToken')
const { standardLimiter } = require('../middlewares/rateLimiter')

router.post('/', verifyToken, standardLimiter, DietController.create)
router.get('/', verifyToken, standardLimiter, DietController.getAll)
router.get('/:id', verifyToken, standardLimiter, DietController.getById)
router.get('/pet/:petId', verifyToken, standardLimiter, DietController.getByPetId)
router.put('/:id', verifyToken, standardLimiter, DietController.update)
router.delete('/:id', verifyToken, standardLimiter, DietController.delete)

module.exports = router