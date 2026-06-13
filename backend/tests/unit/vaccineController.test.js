const VaccineController = require('../../controllers/VaccineController')

const CreateVaccineUseCase = require('../../useCases/vaccine/CreateVaccineUseCase')
const GetVaccineUseCase = require('../../useCases/vaccine/GetVaccineUseCase')
const UpdateVaccineUseCase = require('../../useCases/vaccine/UpdateVaccineUseCase')
const DeleteVaccineUseCase = require('../../useCases/vaccine/DeleteVaccineUseCase')

jest.mock('../../useCases/vaccine/CreateVaccineUseCase')
jest.mock('../../useCases/vaccine/GetVaccineUseCase')
jest.mock('../../useCases/vaccine/UpdateVaccineUseCase')
jest.mock('../../useCases/vaccine/DeleteVaccineUseCase')

describe('VaccineController', () => {
  let req
  let res

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should return 422 when validation fails', async () => {
      req.body = {}

      await VaccineController.create(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalled()
    })

    it('should create vaccine successfully', async () => {
      const vaccine = {
        _id: '123',
        name: 'Raiva',
        manufacturer: 'Zoetis',
        doses: 1,
      }

      req.body = {
        name: 'Raiva',
        manufacturer: 'Zoetis',
        doses: 1,
      }

      CreateVaccineUseCase.mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue(vaccine),
      }))

      await VaccineController.create(req, res)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(vaccine)
    })
  })

  describe('getAll', () => {
    it('should return all vaccines', async () => {
      const vaccines = [
        {
          _id: '1',
          name: 'Raiva',
        },
      ]

      GetVaccineUseCase.mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue(vaccines),
      }))

      await VaccineController.getAll(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(vaccines)
    })
  })

  describe('update', () => {
    it('should update vaccine successfully', async () => {
      const updatedVaccine = {
        _id: '1',
        name: 'Raiva Atualizada',
      }

      req.params.id = '1'

      req.body = {
        name: 'Raiva Atualizada',
      }

      UpdateVaccineUseCase.mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue(updatedVaccine),
      }))

      await VaccineController.update(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(updatedVaccine)
    })
  })

  describe('delete', () => {
    it('should delete vaccine successfully', async () => {
      req.params.id = '1'

      DeleteVaccineUseCase.mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue(),
      }))

      await VaccineController.delete(req, res)

      expect(res.status).toHaveBeenCalledWith(200)

      expect(res.json).toHaveBeenCalledWith({
        message: 'Vaccine removed',
      })
    })
  })
})