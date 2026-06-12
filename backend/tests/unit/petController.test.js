const PetController = require('../../controllers/PetController');
const Pet = require('../../models/Pet');

jest.mock('../../models/Pet');
jest.mock('../../helpers/get-user-by-token');
jest.mock('../../helpers/get-token');

describe('PetController - Novos campos', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      files: [{ filename: 'pet1.jpg' }],
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getVaccinatedPets', () => {
    test('deve listar apenas pets vacinados', async () => {
      const mockPets = [
        { name: 'Rex', vaccinated: true },
        { name: 'Luna', vaccinated: true }
      ];

      Pet.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPets)
      });

      await PetController.getVaccinatedPets(req, res);

      expect(Pet.find).toHaveBeenCalledWith({ vaccinated: true });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getPetsByHealthStatus', () => {
    test('deve listar pets por status de saúde', async () => {
      req.params = { status: 'sick' };
      const mockPets = [
        { name: 'Rex', healthStatus: 'sick' },
        { name: 'Luna', healthStatus: 'sick' }
      ];

      Pet.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPets)
      });

      await PetController.getPetsByHealthStatus(req, res);

      expect(Pet.find).toHaveBeenCalledWith({ healthStatus: 'sick' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('deve retornar erro para status inválido', async () => {
      req.params = { status: 'invalid' };

      await PetController.getPetsByHealthStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
    });
  });

  describe('update - Novos campos', () => {
    test('deve atualizar vaccinated e healthStatus', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = {
        vaccinated: 'true',
        healthStatus: 'treatment'
      };

      const mockPet = {
        _id: '507f1f77bcf86cd799439011',
        user: { _id: '123' },
        name: 'Rex',
        save: jest.fn()
      };

      const mockUser = { _id: '123' };
      
      Pet.findById.mockResolvedValue(mockPet);
      require('../../helpers/get-user-by-token').mockResolvedValue(mockUser);
      require('../../helpers/get-token').mockReturnValue('token');
      Pet.findByIdAndUpdate = jest.fn().mockResolvedValue(true);

      await PetController.updatePet(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});

console.log('✅ Testes do PetController com novos campos');
