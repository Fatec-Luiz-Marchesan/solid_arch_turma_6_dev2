const router = require('express').Router()
const DietController = require('../controllers/DietController')
const verifyToken = require('../helpers/verifyToken')
const { standardLimiter } = require('../middlewares/rateLimiter')

router.post('/', standardLimiter, verifyToken, (req, res) => DietController.create(req, res))
router.get('/', standardLimiter, verifyToken, (req, res) => DietController.getAll(req, res))
router.get('/report', standardLimiter, verifyToken, (req, res) => DietController.getReport(req, res))
router.get('/:id', standardLimiter, verifyToken, (req, res) => DietController.getById(req, res))
router.get('/pet/:petId', standardLimiter, verifyToken, (req, res) => DietController.getByPetId(req, res))
router.put('/:id', standardLimiter, verifyToken, (req, res) => DietController.update(req, res))
router.delete('/:id', standardLimiter, verifyToken, (req, res) => DietController.delete(req, res))

module.exports = router
