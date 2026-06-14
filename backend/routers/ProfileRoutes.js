const router = require('express').Router()
const ProfileController = require('../controllers/ProfileController')

router.post('/', ProfileController.create)
router.get('/', ProfileController.getAll)
router.get('/id/:id', ProfileController.getById)
router.get('/user/:userId', ProfileController.getByUserId)
router.put('/:id', ProfileController.update)
router.delete('/:id', ProfileController.delete)
router.delete('/user/:userId', ProfileController.deleteByUserId)

module.exports = router