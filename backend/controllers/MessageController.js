const CreateMessageUseCase = require('../useCases/message/CreateMessageUseCase')
const GetMessageUseCase = require('../useCases/message/GetMessageUseCase')
const UpdateMessageUseCase = require('../useCases/message/UpdateMessageUseCase')
const DeleteMessageUseCase = require('../useCases/message/DeleteMessageUseCase')

const createUC = new CreateMessageUseCase()
const getUC = new GetMessageUseCase()
const updateUC = new UpdateMessageUseCase()
const deleteUC = new DeleteMessageUseCase()

class MessageController {
    async create(req, res) {
        try {
            const message = await createUC.execute(req.body)
            res.status(201).json({ message: 'Mensagem enviada', data: message })
        } catch (error) {
            if (error.message.includes('obrigatório') || error.message.includes('inválido')) {
                res.status(422).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
    
    async getById(req, res) {
        try {
            const message = await getUC.execute(req.params.id)
            res.status(200).json(message)
        } catch (error) {
            if (error.message === 'ID inválido') {
                res.status(422).json({ message: error.message })
            } else if (error.message === 'Mensagem não encontrada') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
    
    async getConversation(req, res) {
        try {
            const { userId1, userId2 } = req.params
            const { page, limit } = req.query
            const result = await getUC.getConversation(userId1, userId2, page, limit)
            res.status(200).json(result)
        } catch (error) {
            if (error.message === 'IDs inválidos') {
                res.status(422).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
    
    async getUnreadCount(req, res) {
        try {
            const { userId } = req.params
            const result = await getUC.getUnreadCount(userId)
            res.status(200).json(result)
        } catch (error) {
            if (error.message === 'userId inválido') {
                res.status(422).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
    
    async markAsRead(req, res) {
        try {
            const message = await updateUC.markAsRead(req.params.id)
            res.status(200).json({ message: 'Mensagem marcada como lida', data: message })
        } catch (error) {
            if (error.message === 'ID inválido') {
                res.status(422).json({ message: error.message })
            } else if (error.message === 'Mensagem não encontrada') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
    
    async deleteForUser(req, res) {
        try {
            const { id, userId } = req.params
            const result = await updateUC.deleteForUser(id, userId)
            res.status(200).json(result)
        } catch (error) {
            if (error.message === 'IDs inválidos') {
                res.status(422).json({ message: error.message })
            } else if (error.message === 'Mensagem não encontrada') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
    
    async delete(req, res) {
        try {
            const result = await deleteUC.execute(req.params.id)
            res.status(200).json(result)
        } catch (error) {
            if (error.message === 'ID inválido') {
                res.status(422).json({ message: error.message })
            } else if (error.message === 'Mensagem não encontrada') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
}

module.exports = new MessageController()