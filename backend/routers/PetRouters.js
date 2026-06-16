const router = require('express').Router()
const PetController = require('../controllers/PetController')
const verifyToken = require('../helpers/check-token')
const { imageUpload } = require('../helpers/image-upload')
const { strictLimiter, apiLimiter, authLimiter } = require('../middlewares/rateLimiter')

router.get('/vaccinated', apiLimiter, PetController.getVaccinatedPets)
router.get('/health/:status', apiLimiter, PetController.getPetsByHealthStatus)

router.post('/create', authLimiter, verifyToken, imageUpload.array('images'), PetController.create)
router.get('/', apiLimiter, PetController.getAll)
router.get('/mypets', apiLimiter, verifyToken, PetController.getAllUserPets)
router.get('/myadoptions', apiLimiter, verifyToken, PetController.getAllUserAdoptions)
router.get('/:id', apiLimiter, PetController.getPetById)
router.put('/:id', strictLimiter, verifyToken, imageUpload.array('images'), PetController.updatePet)
router.delete('/:id', strictLimiter, verifyToken, PetController.deletePet)
router.patch('/schedule/:id', strictLimiter, verifyToken, PetController.schedule)
router.patch('/conclude/:id', strictLimiter, verifyToken, PetController.concludeAdoption)

module.exports = router
