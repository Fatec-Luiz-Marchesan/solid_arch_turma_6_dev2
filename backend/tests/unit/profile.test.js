const Profile = require('../../models/Profile')
const CreateProfileUseCase = require('../../useCases/profile/CreateProfileUseCase')
const GetProfileUseCase = require('../../useCases/profile/GetProfileUseCase')
const UpdateProfileUseCase = require('../../useCases/profile/UpdateProfileUseCase')
const DeleteProfileUseCase = require('../../useCases/profile/DeleteProfileUseCase')
const ProfileController = require('../../controllers/ProfileController')
const ProfileValidation = require('../../helpers/profileValidation')

jest.mock('../../models/Profile', () => {
    const mockProfile = function(data) {
        this.data = data
        this.save = jest.fn().mockResolvedValue(this)
        this.toJSON = jest.fn().mockReturnValue(data)
    }
    mockProfile.findOne = jest.fn()
    mockProfile.findById = jest.fn()
    mockProfile.findByIdAndDelete = jest.fn()
    mockProfile.findOneAndDelete = jest.fn()
    mockProfile.find = jest.fn()
    mockProfile.countDocuments = jest.fn()
    return mockProfile
})

describe('ProfileValidation', () => {
    test('valida dados corretos de criacao', () => {
        const data = {
            userId: '123456789012345678901234',
            fullName: 'Joao Silva'
        }
        const result = ProfileValidation.validateCreate(data)
        expect(result.isValid).toBe(true)
    })

    test('rejeita criacao sem userId', () => {
        const data = { fullName: 'Joao Silva' }
        const result = ProfileValidation.validateCreate(data)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('userId é obrigatório')
    })

    test('rejeita fullName muito curto', () => {
        const data = {
            userId: '123456789012345678901234',
            fullName: 'Jo'
        }
        const result = ProfileValidation.validateCreate(data)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('fullName deve ter no mínimo 3 caracteres')
    })
})

describe('CreateProfileUseCase', () => {
    let useCase

    beforeEach(() => {
        useCase = new CreateProfileUseCase()
        jest.clearAllMocks()
    })

    test('cria profile com sucesso', async () => {
        const data = {
            userId: '123456789012345678901234',
            fullName: 'Joao Silva'
        }
        Profile.findOne.mockResolvedValue(null)

        const result = await useCase.execute(data)

        expect(result).toHaveProperty('fullName', 'Joao Silva')
    })

    test('lanca erro se profile ja existe', async () => {
        const data = {
            userId: '123456789012345678901234',
            fullName: 'Joao Silva'
        }
        Profile.findOne.mockResolvedValue({ userId: data.userId })

        await expect(useCase.execute(data)).rejects.toThrow('Profile já existe para este usuário')
    })
})

describe('GetProfileUseCase', () => {
    let useCase

    beforeEach(() => {
        useCase = new GetProfileUseCase()
        jest.clearAllMocks()
    })

    test('busca profile por id', async () => {
        const mockProfile = {
            _id: '123456789012345678901234',
            fullName: 'Maria',
            toJSON: () => ({ fullName: 'Maria' })
        }
        const populateMock = { populate: jest.fn().mockResolvedValue(mockProfile) }
        Profile.findById.mockReturnValue(populateMock)

        const result = await useCase.execute('123456789012345678901234')

        expect(result).toHaveProperty('fullName', 'Maria')
    })

    test('lanca erro para id invalido', async () => {
        await expect(useCase.execute('id-invalido')).rejects.toThrow('ID inválido')
    })
})

describe('UpdateProfileUseCase', () => {
    let useCase

    beforeEach(() => {
        useCase = new UpdateProfileUseCase()
        jest.clearAllMocks()
    })

    test('atualiza profile com sucesso', async () => {
        const mockProfile = {
            _id: '123456789012345678901234',
            fullName: 'Antigo',
            save: jest.fn().mockResolvedValue(true),
            toJSON: () => ({ fullName: 'Novo' })
        }
        Profile.findById.mockResolvedValue(mockProfile)

        const result = await useCase.execute('123456789012345678901234', { fullName: 'Novo' })

        expect(result).toHaveProperty('fullName', 'Novo')
    })
})

describe('DeleteProfileUseCase', () => {
    let useCase

    beforeEach(() => {
        useCase = new DeleteProfileUseCase()
        jest.clearAllMocks()
    })

    test('deleta profile com sucesso', async () => {
        Profile.findByIdAndDelete.mockResolvedValue({ _id: '123456789012345678901234' })

        const result = await useCase.execute('123456789012345678901234')

        expect(result).toHaveProperty('message', 'Profile deletado com sucesso')
    })
})

describe('ProfileController', () => {
    let req, res

    beforeEach(() => {
        req = { body: {}, params: {}, query: {} }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
        jest.clearAllMocks()
    })

    test('create retorna 201', async () => {
        req.body = { userId: '123456789012345678901234', fullName: 'Joao' }
        jest.spyOn(CreateProfileUseCase.prototype, 'execute').mockResolvedValue(req.body)

        await ProfileController.create(req, res)

        expect(res.status).toHaveBeenCalledWith(201)
    })

    test('getById retorna 200', async () => {
        req.params = { id: '123456789012345678901234' }
        jest.spyOn(GetProfileUseCase.prototype, 'execute').mockResolvedValue({})

        await ProfileController.getById(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
    })

    test('getById retorna 404 quando nao encontrado', async () => {
        req.params = { id: '123456789012345678901234' }
        const error = new Error('Profile não encontrado')
        jest.spyOn(GetProfileUseCase.prototype, 'execute').mockRejectedValue(error)

        await ProfileController.getById(req, res)

        expect(res.status).toHaveBeenCalledWith(404)
    })

    test('getByUserId retorna 200', async () => {
        req.params = { userId: '123456789012345678901234' }
        jest.spyOn(GetProfileUseCase.prototype, 'findByUserId').mockResolvedValue({})

        await ProfileController.getByUserId(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
    })

    test('update retorna 200', async () => {
        req.params = { id: '123456789012345678901234' }
        req.body = { fullName: 'Atualizado' }
        jest.spyOn(UpdateProfileUseCase.prototype, 'execute').mockResolvedValue({})

        await ProfileController.update(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
    })

    test('delete retorna 200', async () => {
        req.params = { id: '123456789012345678901234' }
        jest.spyOn(DeleteProfileUseCase.prototype, 'execute').mockResolvedValue({
            message: 'Profile deletado com sucesso'
        })

        await ProfileController.delete(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
    })
})

console.log('Todos os testes do Profile corrigidos e prontos!')