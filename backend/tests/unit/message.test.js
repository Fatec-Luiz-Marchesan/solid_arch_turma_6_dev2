const Message = require('../../models/Message')
const MessageValidation = require('../../helpers/messageValidation')
const CreateMessageUseCase = require('../../useCases/message/CreateMessageUseCase')
const GetMessageUseCase = require('../../useCases/message/GetMessageUseCase')
const UpdateMessageUseCase = require('../../useCases/message/UpdateMessageUseCase')
const DeleteMessageUseCase = require('../../useCases/message/DeleteMessageUseCase')
const MessageController = require('../../controllers/MessageController')

jest.mock('../../models/Message')

describe('MessageValidation', () => {
    test('valida dados corretos de criacao', () => {
        const data = {
            senderId: '123456789012345678901234',
            receiverId: '123456789012345678901235',
            content: 'Olá, tudo bem?'
        }
        const result = MessageValidation.validateCreate(data)
        expect(result.isValid).toBe(true)
    })
    
    test('rejeita criacao sem senderId', () => {
        const data = {
            receiverId: '123456789012345678901235',
            content: 'Olá'
        }
        const result = MessageValidation.validateCreate(data)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('senderId é obrigatório')
    })
    
    test('rejeita criacao sem receiverId', () => {
        const data = {
            senderId: '123456789012345678901234',
            content: 'Olá'
        }
        const result = MessageValidation.validateCreate(data)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('receiverId é obrigatório')
    })
    
    test('rejeita conteudo muito longo', () => {
        const data = {
            senderId: '123456789012345678901234',
            receiverId: '123456789012345678901235',
            content: 'a'.repeat(1001)
        }
        const result = MessageValidation.validateCreate(data)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('conteúdo deve ter no máximo 1000 caracteres')
    })
    
    test('valida importance correta', () => {
        const data = {
            senderId: '123456789012345678901234',
            receiverId: '123456789012345678901235',
            content: 'Mensagem importante',
            importance: 'high'
        }
        const result = MessageValidation.validateCreate(data)
        expect(result.isValid).toBe(true)
    })
    
    test('rejeita importance invalida', () => {
        const data = {
            senderId: '123456789012345678901234',
            receiverId: '123456789012345678901235',
            content: 'Mensagem',
            importance: 'urgente'
        }
        const result = MessageValidation.validateCreate(data)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('importance deve ser low, normal ou high')
    })
})

describe('CreateMessageUseCase', () => {
    let useCase
    
    beforeEach(() => {
        useCase = new CreateMessageUseCase()
        jest.clearAllMocks()
    })
    
    test('cria mensagem com sucesso', async () => {
        const data = {
            senderId: '123456789012345678901234',
            receiverId: '123456789012345678901235',
            content: 'Olá mundo!'
        }
        Message.prototype.save = jest.fn().mockResolvedValue(data)
        Message.prototype.toJSON = jest.fn().mockReturnValue(data)
        
        const result = await useCase.execute(data)
        expect(result).toHaveProperty('content', data.content)
    })
    
    test('lanca erro com dados invalidos', async () => {
        const data = {
            senderId: '123',
            receiverId: '123456789012345678901235',
            content: 'Olá'
        }
        
        await expect(useCase.execute(data)).rejects.toThrow()
    })
})

describe('GetMessageUseCase', () => {
    let useCase
    
    beforeEach(() => {
        useCase = new GetMessageUseCase()
        jest.clearAllMocks()
    })
    
    test('busca mensagem por id', async () => {
        const mockMessage = {
            _id: '123456789012345678901234',
            content: 'Teste',
            toJSON: () => ({ _id: '123456789012345678901234', content: 'Teste' })
        }
        
        Message.findById.mockResolvedValue(mockMessage)
        
        const result = await useCase.execute('123456789012345678901234')
        expect(result).toBeDefined()
        expect(result.content).toBe('Teste')
    })
    
    test('retorna erro para id invalido', async () => {
        await expect(useCase.execute('id-invalido')).rejects.toThrow('ID inválido')
    })
    
    test('retorna erro quando mensagem nao encontrada', async () => {
        Message.findById.mockResolvedValue(null)
        
        await expect(useCase.execute('123456789012345678901234')).rejects.toThrow('Mensagem não encontrada')
    })
    
    test('retorna contagem de nao lidas', async () => {
        Message.countDocuments.mockResolvedValue(5)
        
        const result = await useCase.getUnreadCount('123456789012345678901234')
        expect(result).toHaveProperty('unreadCount', 5)
    })
    
    test('retorna erro para userId invalido no unreadCount', async () => {
        await expect(useCase.getUnreadCount('invalido')).rejects.toThrow('userId inválido')
    })
})

describe('UpdateMessageUseCase', () => {
    let useCase
    
    beforeEach(() => {
        useCase = new UpdateMessageUseCase()
        jest.clearAllMocks()
    })
    
    test('marca mensagem como lida', async () => {
        const mockMessage = {
            _id: '123456789012345678901234',
            read: false,
            save: jest.fn().mockResolvedValue(true),
            toJSON: () => ({ _id: '123456789012345678901234', read: true })
        }
        Message.findById.mockResolvedValue(mockMessage)
        
        const result = await useCase.markAsRead('123456789012345678901234')
        expect(result).toHaveProperty('read', true)
    })
    
    test('retorna erro ao marcar como lida com id invalido', async () => {
        await expect(useCase.markAsRead('invalido')).rejects.toThrow('ID inválido')
    })
    
    test('deleta mensagem para usuario', async () => {
        const mockMessage = {
            _id: '123456789012345678901234',
            deletedBy: [],
            save: jest.fn().mockResolvedValue(true)
        }
        Message.findById.mockResolvedValue(mockMessage)
        
        const result = await useCase.deleteForUser('123456789012345678901234', '123456789012345678901235')
        expect(result).toHaveProperty('message', 'Mensagem deletada com sucesso')
    })
})

describe('DeleteMessageUseCase', () => {
    let useCase
    
    beforeEach(() => {
        useCase = new DeleteMessageUseCase()
        jest.clearAllMocks()
    })
    
    test('deleta mensagem permanentemente', async () => {
        Message.findByIdAndDelete.mockResolvedValue({ _id: '123456789012345678901234' })
        
        const result = await useCase.execute('123456789012345678901234')
        expect(result).toHaveProperty('message', 'Mensagem deletada com sucesso')
    })
    
    test('retorna erro ao deletar com id invalido', async () => {
        await expect(useCase.execute('invalido')).rejects.toThrow('ID inválido')
    })
})

describe('MessageController', () => {
    let req, res
    
    beforeEach(() => {
        req = { body: {}, params: {}, query: {} }
        res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() }
        jest.clearAllMocks()
    })
    
    test('create retorna 201', async () => {
        req.body = {
            senderId: '123456789012345678901234',
            receiverId: '123456789012345678901235',
            content: 'Olá'
        }
        jest.spyOn(CreateMessageUseCase.prototype, 'execute').mockResolvedValue(req.body)
        
        await MessageController.create(req, res)
        expect(res.status).toHaveBeenCalledWith(201)
    })
    
    test('create retorna 422 com dados invalidos', async () => {
        req.body = { content: 'Olá' }
        const error = new Error('senderId é obrigatório')
        jest.spyOn(CreateMessageUseCase.prototype, 'execute').mockRejectedValue(error)
        
        await MessageController.create(req, res)
        expect(res.status).toHaveBeenCalledWith(422)
    })
    
    test('getById retorna 200', async () => {
        req.params = { id: '123456789012345678901234' }
        jest.spyOn(GetMessageUseCase.prototype, 'execute').mockResolvedValue({})
        
        await MessageController.getById(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
    })
    
    test('getById retorna 404 quando nao encontrado', async () => {
        req.params = { id: '123456789012345678901234' }
        const error = new Error('Mensagem não encontrada')
        jest.spyOn(GetMessageUseCase.prototype, 'execute').mockRejectedValue(error)
        
        await MessageController.getById(req, res)
        expect(res.status).toHaveBeenCalledWith(404)
    })
    
    test('getUnreadCount retorna 200', async () => {
        req.params = { userId: '123456789012345678901234' }
        jest.spyOn(GetMessageUseCase.prototype, 'getUnreadCount').mockResolvedValue({ unreadCount: 3 })
        
        await MessageController.getUnreadCount(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
    })
    
    test('markAsRead retorna 200', async () => {
        req.params = { id: '123456789012345678901234' }
        jest.spyOn(UpdateMessageUseCase.prototype, 'markAsRead').mockResolvedValue({})
        
        await MessageController.markAsRead(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
    })
    
    test('deleteForUser retorna 200', async () => {
        req.params = { id: '123456789012345678901234', userId: '123456789012345678901235' }
        jest.spyOn(UpdateMessageUseCase.prototype, 'deleteForUser').mockResolvedValue({ message: 'Mensagem deletada com sucesso' })
        
        await MessageController.deleteForUser(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
    })
    
    test('delete retorna 200', async () => {
        req.params = { id: '123456789012345678901234' }
        jest.spyOn(DeleteMessageUseCase.prototype, 'execute').mockResolvedValue({ message: 'Mensagem deletada com sucesso' })
        
        await MessageController.delete(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
    })
})

console.log('Testes do Message finalizados!')