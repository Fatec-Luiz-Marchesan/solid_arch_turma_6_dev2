const Diet = require('../../models/Diet')
const DietValidation = require('../../helpers/dietValidation')
const CreateDietUseCase = require('../../useCases/diet/CreateDietUseCase')
const GetDietUseCase = require('../../useCases/diet/GetDietUseCase')
const UpdateDietUseCase = require('../../useCases/diet/UpdateDietUseCase')
const DeleteDietUseCase = require('../../useCases/diet/DeleteDietUseCase')
const DietController = require('../../controllers/DietController')

jest.mock('../../models/Diet')

describe('DietValidation', () => {
    test('valida refeicao correta', () => {
        const meal = { name: 'Café da manhã', time: '08:00', calories: 300 }
        const result = DietValidation.validateMeal(meal)
        expect(result.isValid).toBe(true)
    })
    
    test('rejeita refeicao sem nome', () => {
        const meal = { time: '08:00' }
        const result = DietValidation.validateMeal(meal)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('nome da refeição é obrigatório')
    })
    
    test('rejeita horario invalido', () => {
        const meal = { name: 'Almoço', time: '25:00' }
        const result = DietValidation.validateMeal(meal)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('horário inválido, use formato HH:MM')
    })
    
    test('valida criacao de dieta', () => {
        const data = {
            petId: '123456789012345678901234',
            meals: [{ name: 'Café', time: '08:00' }],
            createdBy: '123456789012345678901234'
        }
        const result = DietValidation.validateCreate(data)
        expect(result.isValid).toBe(true)
    })
})

describe('CreateDietUseCase', () => {
    let useCase
    
    beforeEach(() => {
        useCase = new CreateDietUseCase()
        jest.clearAllMocks()
    })
    
    test('cria dieta com sucesso', async () => {
        const data = {
            petId: '123456789012345678901234',
            meals: [{ name: 'Café', time: '08:00' }],
            createdBy: '123456789012345678901234'
        }
        Diet.prototype.save = jest.fn().mockResolvedValue(data)
        Diet.prototype.toJSON = jest.fn().mockReturnValue(data)
        
        const result = await useCase.execute(data)
        expect(result).toHaveProperty('petId', data.petId)
    })
})

describe('GetDietUseCase', () => {
    let useCase
    
    beforeEach(() => {
        useCase = new GetDietUseCase()
        jest.clearAllMocks()
    })
    
    test('busca dieta por id', async () => {
        const mockDiet = {
            _id: '123456789012345678901234',
            petId: '456',
            toJSON: () => ({ _id: '123456789012345678901234', petId: '456' })
        }
        
        const execMock = {
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockDiet)
        }
        
        Diet.findById.mockReturnValue(execMock)
        
        const result = await useCase.execute('123456789012345678901234')
        expect(result).toBeDefined()
    })
})

describe('UpdateDietUseCase', () => {
    let useCase
    
    beforeEach(() => {
        useCase = new UpdateDietUseCase()
        jest.clearAllMocks()
    })
    
    test('atualiza dieta com sucesso', async () => {
        const mockDiet = { 
            _id: '123456789012345678901234', 
            save: jest.fn().mockResolvedValue(true), 
            toJSON: () => ({}) 
        }
        Diet.findById.mockResolvedValue(mockDiet)
        
        const result = await useCase.execute('123456789012345678901234', { isActive: false })
        expect(result).toBeDefined()
    })
})

describe('DeleteDietUseCase', () => {
    let useCase
    
    beforeEach(() => {
        useCase = new DeleteDietUseCase()
        jest.clearAllMocks()
    })
    
    test('deleta dieta com sucesso', async () => {
        Diet.findByIdAndDelete.mockResolvedValue({ _id: '123456789012345678901234' })
        
        const result = await useCase.execute('123456789012345678901234')
        expect(result).toHaveProperty('message', 'Dieta deletada com sucesso')
    })
})

describe('DietController', () => {
    let req, res
    
    beforeEach(() => {
        req = { body: {}, params: {}, query: {} }
        res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() }
        jest.clearAllMocks()
    })
    
    test('create retorna 201', async () => {
        req.body = { petId: '123456789012345678901234', meals: [{ name: 'Café', time: '08:00' }] }
        jest.spyOn(CreateDietUseCase.prototype, 'execute').mockResolvedValue(req.body)
        
        await DietController.create(req, res)
        expect(res.status).toHaveBeenCalledWith(201)
    })
    
    test('getById retorna 200', async () => {
        req.params = { id: '123456789012345678901234' }
        jest.spyOn(GetDietUseCase.prototype, 'execute').mockResolvedValue({})
        
        await DietController.getById(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
    })
    
    test('getById retorna 404 quando nao encontrado', async () => {
        req.params = { id: '123456789012345678901234' }
        const error = new Error('Dieta não encontrada')
        jest.spyOn(GetDietUseCase.prototype, 'execute').mockRejectedValue(error)
        
        await DietController.getById(req, res)
        expect(res.status).toHaveBeenCalledWith(404)
    })
    
    test('update retorna 200', async () => {
        req.params = { id: '123456789012345678901234' }
        req.body = { isActive: false }
        jest.spyOn(UpdateDietUseCase.prototype, 'execute').mockResolvedValue({})
        
        await DietController.update(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
    })
    
    test('delete retorna 200', async () => {
        req.params = { id: '123456789012345678901234' }
        jest.spyOn(DeleteDietUseCase.prototype, 'execute').mockResolvedValue({ message: 'Dieta deletada com sucesso' })
        
        await DietController.delete(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
    })
})

console.log('Testes do Diet finalizados!')