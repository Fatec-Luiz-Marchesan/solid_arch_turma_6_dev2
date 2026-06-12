const router = require('express').Router()
const LocationController = require('../controllers/LocationController')
const verifyToken = require('../helpers/check-token')

router.post('/create', verifyToken, LocationController.create)
router.delete('/:id', verifyToken, LocationController.delete)

router.get('/pet/:petId', LocationController.getByPet)
router.get('/:id', LocationController.getById)

module.exports = router