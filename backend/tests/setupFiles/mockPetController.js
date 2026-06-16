
jest.mock('../../controllers/PetController', () => {
  const methods = ['create','getAll','getAllUserPets','getAllUserAdoptions','getPetById','updatePet','deletePet','schedule','concludeAdoption','getVaccinatedPets','getPetsByHealthStatus'];
  const mock = {};
  methods.forEach(m => { mock[m] = jest.fn().mockResolvedValue({}); });
  return mock;
}, { virtual: true });
