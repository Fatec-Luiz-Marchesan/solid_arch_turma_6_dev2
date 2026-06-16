// Mock do PetController para testes que importam index.js
jest.mock('../../controllers/PetController', () => {
  const mock = {};
  const methods = [
    'create', 'getAll', 'getAllUserPets', 'getAllUserAdoptions',
    'getPetById', 'updatePet', 'deletePet', 'schedule',
    'concludeAdoption', 'getVaccinatedPets', 'getPetsByHealthStatus'
  ];
  methods.forEach(m => { mock[m] = jest.fn().mockResolvedValue({}); });
  return mock;
});
