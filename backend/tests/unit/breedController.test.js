const BreedController = require('../../controllers/BreedController')

const CreateBreedUseCase = require('../../useCases/breed/CreateBreedUseCase')
const GetBreedsUseCase = require('../../useCases/breed/GetBreedsUseCase')
const GetBreedByIdUseCase = require('../../useCases/breed/GetBreedByIdUseCase')
const UpdateBreedUseCase = require('../../useCases/breed/UpdateBreedUseCase')
const DeleteBreedUseCase = require('../../useCases/breed/DeleteBreedUseCase')

jest.mock('../../useCases/breed/CreateBreedUseCase')
jest.mock('../../useCases/breed/GetBreedsUseCase')
jest.mock('../../useCases/breed/GetBreedByIdUseCase')
jest.mock('../../useCases/breed/UpdateBreedUseCase')
jest.mock('../../useCases/breed/DeleteBreedUseCase')

describe('BreedController', () => {
  let req
  let res

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    jest.clearAllMocks()
  })

  test('deve criar uma raça', async () => {
    const breed = {
      name: 'Golden Retriever',
      species: 'dog'
    }

    CreateBreedUseCase.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(breed)
    }))

    req.body = breed

    await BreedController.create(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(breed)
  })

  test('deve listar todas as raças', async () => {
    const breeds = [
      { name: 'Golden Retriever', species: 'dog' },
      { name: 'Persian', species: 'cat' }
    ]

    GetBreedsUseCase.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(breeds)
    }))

    await BreedController.getAll(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(breeds)
  })

  test('deve buscar raça por id', async () => {
    const breed = {
      _id: '123',
      name: 'Golden Retriever'
    }

    req.params.id = '123'

    GetBreedByIdUseCase.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(breed)
    }))

    await BreedController.getById(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(breed)
  })

  test('deve atualizar uma raça', async () => {
    const updatedBreed = {
      _id: '123',
      name: 'Golden Updated'
    }

    req.params.id = '123'
    req.body = { name: 'Golden Updated' }

    UpdateBreedUseCase.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(updatedBreed)
    }))

    await BreedController.update(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(updatedBreed)
  })

  test('deve deletar uma raça', async () => {
    req.params.id = '123'

    DeleteBreedUseCase.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue()
    }))

    await BreedController.delete(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
  })
})

console.log('✅ Testes do BreedController executados')