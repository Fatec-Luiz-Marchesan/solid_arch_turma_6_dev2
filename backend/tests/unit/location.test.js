const Location = require('../../models/Location')
const LocationValidation = require('../../helpers/locationValidation')
const CreateLocationUseCase = require('../../useCases/location/CreateLocationUseCase')
const GetLocationUseCase = require('../../useCases/location/GetLocationUseCase')
const UpdateLocationUseCase = require('../../useCases/location/UpdateLocationUseCase')
const DeleteLocationUseCase = require('../../useCases/location/DeleteLocationUseCase')
const LocationController = require('../../controllers/LocationController')

jest.mock('../../models/Location')

describe('LocationValidation', () => {
    test('valida dados corretos de criacao', () => {
        const data = {
            petId: '123456789012345678901234',
            latitude: -23.5505,
            longitude: -46.6333
        }
        const result = LocationValidation.validateCreate(data)
        expect(result.isValid).toBe(true)
    })
    
    test('rejeita criacao sem petId', () => {
        const data = { latitude: -23.5505, longitude: -46.6333 }
        const result = LocationValidation.validateCreate(data)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('petId é obrigatório')
    })
    
    test('rejeita latitude invalida', () => {
        const data = {
            petId: '123456789012345678901234',
            latitude: -100,
            longitude: -46.6333
        }
        const result = LocationValidation.validateCreate(data)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('latitude deve estar entre -90 e 90')
    })
    
    test('rejeita longitude invalida', () => {
        const data = {
            petId: '123456789012345678901234',
            latitude: -23.5505,
            longitude: -200
        }
        const result = LocationValidation.validateCreate(data)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('longitude deve estar entre -180 e 180')
    })
})

describe('CreateLocationUseCase', () => {
    let useCase
    
    beforeEach(() => {
        useCase = new CreateLocationUseCase()
        jest.clearAllMocks()
    })
    
    test('cria localizacao com sucesso', async () => {
        const data = {
            petId: '123456789012345678901234',
            latitude: -23.5505,
            longitude: -46.6333
        }
        Location.findOne.mockResolvedValue(null)
        Location.prototype.save = jest.fn().mockResolvedValue(data)
        Location.prototype.toJSON = jest.fn().mockReturnValue(data)
        
        const result = await useCase.execute(data)
        expect(result).toHaveProperty('petId', data.petId)
    })
    
    test('lanca erro se localizacao ja existe', async () => {
        const data = {
            petId: '123456789012345678901234',
            latitude: -23.5505,
            longitude: -46.6333
        }
        Location.findOne.mockResolvedValue({ petId: data.petId })
        
        await expect(useCase.execute(data)).rejects.toThrow('Localização já existe para este pet')
    })
})

describe('GetLocationUseCase', () => {
    let useCase
    
    beforeEach(() => {
        useCase = new GetLocationUseCase()
        jest.clearAllMocks()
    })
    
    test('busca localizacao por id', async () => {
        const mockLocation = {
            _id: '123456789012345678901234',
            petId: '456',
            toJSON: () => ({ _id: '123456789012345678901234', petId: '456' })
        }
        
        const populateMock = {
            populate: jest.fn().mockResolvedValue(mockLocation)
        }
        Location.findById.mockReturnValue(populateMock)
        
        const result = await useCase.execute('123456789012345678901234')
        expect(result).toBeDefined()
    })
})

describe('UpdateLocationUseCase', () => {
    let useCase
    
    beforeEach(() => {
        useCase = new UpdateLocationUseCase()
        jest.clearAllMocks()
    })
    
    test('atualiza localizacao com sucesso', async () => {
        const mockLocation = {
            _id: '123456789012345678901234',
            save: jest.fn().mockResolvedValue(true),
            toJSON: () => ({})
        }
        Location.findById.mockResolvedValue(mockLocation)
        
        const result = await useCase.execute('123456789012345678901234', { latitude: -23.5505 })
        expect(result).toBeDefined()
    })
})

describe('DeleteLocationUseCase', () => {
    let useCase
    
    beforeEach(() => {
        useCase = new DeleteLocationUseCase()
        jest.clearAllMocks()
    })
    
    test('deleta localizacao com sucesso', async () => {
        Location.findByIdAndDelete.mockResolvedValue({ _id: '123456789012345678901234' })
        
        const result = await useCase.execute('123456789012345678901234')
        expect(result).toHaveProperty('message', 'Localização deletada com sucesso')
    })
})

describe('LocationController', () => {
    let req, res
    
    beforeEach(() => {
        req = { body: {}, params: {}, query: {} }
        res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() }
        jest.clearAllMocks()
    })
    
    test('create retorna 201', async () => {
        req.body = { petId: '123456789012345678901234', latitude: -23.5505, longitude: -46.6333 }
        jest.spyOn(CreateLocationUseCase.prototype, 'execute').mockResolvedValue(req.body)
        
        await LocationController.create(req, res)
        expect(res.status).toHaveBeenCalledWith(201)
    })
    
    test('getById retorna 200', async () => {
        req.params = { id: '123456789012345678901234' }
        jest.spyOn(GetLocationUseCase.prototype, 'execute').mockResolvedValue({})
        
        await LocationController.getById(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
    })
    
    test('getById retorna 404 quando nao encontrado', async () => {
        req.params = { id: '123456789012345678901234' }
        const error = new Error('Localização não encontrada')
        jest.spyOn(GetLocationUseCase.prototype, 'execute').mockRejectedValue(error)
        
        await LocationController.getById(req, res)
        expect(res.status).toHaveBeenCalledWith(404)
    })
    
    test('update retorna 200', async () => {
        req.params = { id: '123456789012345678901234' }
        req.body = { latitude: -23.5505 }
        jest.spyOn(UpdateLocationUseCase.prototype, 'execute').mockResolvedValue({})
        
        await LocationController.update(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
    })
    
    test('delete retorna 200', async () => {
        req.params = { id: '123456789012345678901234' }
        jest.spyOn(DeleteLocationUseCase.prototype, 'execute').mockResolvedValue({ message: 'Localização deletada com sucesso' })
        
        await LocationController.delete(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
    })
})

console.log('Testes do Location finalizados!')