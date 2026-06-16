const router = require('express').Router()
const PetController = require('../controllers/PetController')
const verifyToken = require('../helpers/check-token')
const { imageUpload } = require('../helpers/image-upload')
const { strictLimiter, authLimiter } = require('../middlewares/rateLimiter')
const rateLimit = require('express-rate-limit')

const petLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.get('/vaccinated', petLimiter, PetController.getVaccinatedPets)
router.get('/health/:status', petLimiter, PetController.getPetsByHealthStatus)
router.get('/', petLimiter, PetController.getAll)
router.get('/:id', petLimiter, PetController.getPetById)

router.post('/create', authLimiter, verifyToken, imageUpload.array('images'), PetController.create)
router.get('/mypets', petLimiter, verifyToken, PetController.getAllUserPets)
router.get('/myadoptions', petLimiter, verifyToken, PetController.getAllUserAdoptions)
router.put('/:id', strictLimiter, verifyToken, imageUpload.array('images'), PetController.updatePet)
router.delete('/:id', strictLimiter, verifyToken, PetController.deletePet)
router.patch('/schedule/:id', strictLimiter, verifyToken, PetController.schedule)
router.patch('/conclude/:id', strictLimiter, verifyToken, PetController.concludeAdoption)

module.exports = router
