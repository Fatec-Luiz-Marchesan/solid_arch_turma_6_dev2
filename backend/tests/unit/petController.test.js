jest.unmock('../../controllers/PetController');

const PetController = require('../../controllers/PetController');
const Pet = require('../../models/Pet');
const getUserByToken = require('../../helpers/get-user-by-token');
const getToken = require('../../helpers/get-token');

jest.mock('../../models/Pet');
jest.mock('../../helpers/get-user-by-token');
jest.mock('../../helpers/get-token');

describe('PetController - Novos campos', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, files: [], headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  describe('getVaccinatedPets', () => {
    test('deve listar apenas pets vacinados', async () => {
      const mockPets = [{ name: 'Rex', vaccinated: true }];
      const sortMock = jest.fn().mockResolvedValue(mockPets);
      Pet.find.mockReturnValue({ sort: sortMock });
      await PetController.getVaccinatedPets(req, res);
      expect(Pet.find).toHaveBeenCalledWith({ vaccinated: true });
      expect(sortMock).toHaveBeenCalledWith('-createdAt');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ pets: mockPets, count: 1 });
    });
  });

  describe('getPetsByHealthStatus', () => {
    test('deve listar pets por status de saúde', async () => {
      req.params = { status: 'sick' };
      const mockPets = [{ name: 'Rex', healthStatus: 'sick' }];
      const sortMock = jest.fn().mockResolvedValue(mockPets);
      Pet.find.mockReturnValue({ sort: sortMock });
      await PetController.getPetsByHealthStatus(req, res);
      expect(Pet.find).toHaveBeenCalledWith({ healthStatus: 'sick' });
      expect(sortMock).toHaveBeenCalledWith('-createdAt');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ pets: mockPets, count: 1, status: 'sick' });
    });

    test('deve retornar erro para status inválido', async () => {
      req.params = { status: 'invalid' };
      await PetController.getPetsByHealthStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ message: 'Status de saúde inválido!' });
    });
  });

  describe('update - Novos campos', () => {
    test('deve atualizar vaccinated e healthStatus', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { vaccinated: 'true', healthStatus: 'treatment' };
      const mockPet = { _id: '507f1f77bcf86cd799439011', user: { _id: '123' }, save: jest.fn() };
      Pet.findById.mockResolvedValue(mockPet);
      getToken.mockReturnValue('token');
      getUserByToken.mockResolvedValue({ _id: '123' });
      Pet.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
      await PetController.updatePet(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Pet atualizado com sucesso!' }));
    });
  });
});
