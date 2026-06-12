const { strictLimiter, standardLimiter } = require('../middlewares/rateLimiter');

router.post('/create', checkToken, strictLimiter, PetController.create);
router.get('/', standardLimiter, PetController.getAll);
router.get('/mypets', checkToken, standardLimiter, PetController.getAllUserPets);
router.get('/myadoptions', checkToken, standardLimiter, PetController.getAllUserAdoptions);
router.get('/:id', standardLimiter, PetController.getPetById);
router.put('/:id', checkToken, strictLimiter, PetController.updatePet);
router.delete('/:id', checkToken, strictLimiter, PetController.deletePet);
router.patch('/schedule/:id', checkToken, strictLimiter, PetController.schedule);
router.patch('/conclude/:id', checkToken, strictLimiter, PetController.concludeAdoption);
router.get('/vaccinated/list', standardLimiter, PetController.getVaccinatedPets);
router.get('/health/:status', standardLimiter, PetController.getPetsByHealthStatus);