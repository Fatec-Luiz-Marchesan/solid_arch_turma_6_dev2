jest.mock('../../models/Vaccine', () => {
  const VaccineMock = jest.fn();

  VaccineMock.findById = jest.fn();
  VaccineMock.find = jest.fn();

  return VaccineMock;
});

jest.mock('../../models/Pet', () => ({
  findById: jest.fn()
}));

jest.mock('../../helpers/get-user-by-token', () => ({
  getUserByToken: jest.fn()
}));

jest.mock('../../config/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

const VaccineController = require('../../controllers/VaccineController');
const Vaccine = require('../../models/Vaccine');
const Pet = require('../../models/Pet');
const { getUserByToken } = require('../../helpers/get-user-by-token');
const logger = require('../../config/logger');

describe('VaccineController', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      headers: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('createVaccine', () => {
    it('deve criar vacina com sucesso', async () => {
      const user = {
        _id: 'userId',
        role: 'user'
      };

      const pet = {
        _id: 'petId',
        user: {
          toString: () => 'userId'
        }
      };

      const vaccine = {
        save: jest.fn().mockResolvedValue(true)
      };

      getUserByToken.mockResolvedValue(user);
      Pet.findById.mockResolvedValue(pet);
      Vaccine.mockImplementation(() => vaccine);

      req.params.petId = 'petId';

      req.body = {
        name: 'Raiva',
        manufacturer: 'Zoetis',
        batchNumber: 'LOT123',
        date: '2025-01-01'
      };

      await VaccineController.createVaccine(req, res);

      expect(Vaccine).toHaveBeenCalled();
      expect(vaccine.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve retornar 404 quando pet não existir', async () => {
      getUserByToken.mockResolvedValue({
        _id: 'userId',
        role: 'user'
      });

      Pet.findById.mockResolvedValue(null);

      req.params.petId = 'petId';

      await VaccineController.createVaccine(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Pet não encontrado'
      });
    });

    it('deve retornar 403 quando acesso for negado', async () => {
      getUserByToken.mockResolvedValue({
        _id: 'outroUsuario',
        role: 'user'
      });

      Pet.findById.mockResolvedValue({
        user: {
          toString: () => 'donoPet'
        }
      });

      req.params.petId = 'petId';

      await VaccineController.createVaccine(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('deve retornar 422 quando dados obrigatórios não forem enviados', async () => {
      getUserByToken.mockResolvedValue({
        _id: 'userId',
        role: 'user'
      });

      Pet.findById.mockResolvedValue({
        user: {
          toString: () => 'userId'
        }
      });

      req.params.petId = 'petId';

      req.body = {
        name: ''
      };

      await VaccineController.createVaccine(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('deve retornar 422 quando fabricante e lote não forem enviados', async () => {
      getUserByToken.mockResolvedValue({
        _id: 'userId',
        role: 'user'
      });

      Pet.findById.mockResolvedValue({
        user: {
          toString: () => 'userId'
        }
      });

      req.params.petId = 'petId';

      req.body = {
        name: 'Raiva',
        date: '2025-01-01'
      };

      await VaccineController.createVaccine(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('deve retornar 500 em erro interno', async () => {
      getUserByToken.mockRejectedValue(new Error('Erro'));

      await VaccineController.createVaccine(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('listVaccinesByPet', () => {
    it('deve listar vacinas', async () => {
      getUserByToken.mockResolvedValue({
        _id: 'userId',
        role: 'user'
      });

      Pet.findById.mockResolvedValue({
        user: {
          toString: () => 'userId'
        }
      });

      Vaccine.find.mockResolvedValue([
        { name: 'Raiva' }
      ]);

      req.params.petId = 'petId';

      await VaccineController.listVaccinesByPet(req, res);

      expect(Vaccine.find).toHaveBeenCalledWith({
        petId: 'petId'
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve permitir acesso para admin', async () => {
      getUserByToken.mockResolvedValue({
        _id: 'adminId',
        role: 'admin'
      });

      Pet.findById.mockResolvedValue({
        user: {
          toString: () => 'outroUsuario'
        }
      });

      Vaccine.find.mockResolvedValue([]);

      req.params.petId = 'petId';

      await VaccineController.listVaccinesByPet(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 403 quando acesso for negado', async () => {
      getUserByToken.mockResolvedValue({
        _id: 'usuarioErrado',
        role: 'user'
      });

      Pet.findById.mockResolvedValue({
        user: {
          toString: () => 'donoPet'
        }
      });

      req.params.petId = 'petId';

      await VaccineController.listVaccinesByPet(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('updateVaccine', () => {
    it('deve atualizar vacina', async () => {
      const vaccine = {
        save: jest.fn().mockResolvedValue(true)
      };

      Vaccine.findById.mockResolvedValue(vaccine);

      req.params.id = 'vacinaId';

      req.body = {
        name: 'Nova Vacina',
        manufacturer: 'Pfizer',
        batchNumber: 'NOVOLOTE'
      };

      await VaccineController.updateVaccine(req, res);

      expect(vaccine.name).toBe('Nova Vacina');
      expect(vaccine.manufacturer).toBe('Pfizer');
      expect(vaccine.batchNumber).toBe('NOVOLOTE');
      expect(vaccine.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 404 quando vacina não existir', async () => {
      Vaccine.findById.mockResolvedValue(null);

      req.params.id = 'vacinaId';

      await VaccineController.updateVaccine(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteVaccine', () => {
    it('deve remover vacina', async () => {
      const vaccine = {
        deleteOne: jest.fn().mockResolvedValue(true)
      };

      Vaccine.findById.mockResolvedValue(vaccine);

      req.params.id = 'vacinaId';

      await VaccineController.deleteVaccine(req, res);

      expect(vaccine.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 404 quando vacina não existir', async () => {
      Vaccine.findById.mockResolvedValue(null);

      req.params.id = 'vacinaId';

      await VaccineController.deleteVaccine(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});