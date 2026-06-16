const router = require('express').Router()
const PetController = require('../controllers/PetController')
const verifyToken = require('../helpers/check-token')
const { imageUpload } = require('../helpers/image-upload')
const { strictLimiter, standardLimiter, authLimiter } = require('../middlewares/rateLimiter')

router.get('/vaccinated', standardLimiter, PetController.getVaccinatedPets)
router.get('/health/:status', standardLimiter, PetController.getPetsByHealthStatus)

router.post('/create', authLimiter, verifyToken, imageUpload.array('images'), PetController.create)
router.get('/', standardLimiter, PetController.getAll)
router.get('/mypets', standardLimiter, verifyToken, PetController.getAllUserPets)
router.get('/myadoptions', standardLimiter, verifyToken, PetController.getAllUserAdoptions)
router.get('/:id', standardLimiter, PetController.getPetById)
router.put('/:id', strictLimiter, verifyToken, imageUpload.array('images'), PetController.updatePet)
router.delete('/:id', strictLimiter, verifyToken, PetController.deletePet)
router.patch('/schedule/:id', strictLimiter, verifyToken, PetController.schedule)
router.patch('/conclude/:id', strictLimiter, verifyToken, PetController.concludeAdoption)

module.exports = router
