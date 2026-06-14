const Message = require('../../models/Message')
const MessageValidation = require('../../helpers/messageValidation')
const logger = require('../../config/logger')

class UpdateMessageUseCase {
    async markAsRead(id) {
        if (!MessageValidation.validateId(id)) {
            throw new Error('ID inválido')
        }
        
        const message = await Message.findById(id)
        
        if (!message) {
            throw new Error('Mensagem não encontrada')
        }
        
        message.read = true
        message.readAt = new Date()
        await message.save()
        
        logger.info(`Mensagem marcada como lida: ${id}`)
        
        return message.toJSON()
    }
    
    async markAsDelivered(id) {
        if (!MessageValidation.validateId(id)) {
            throw new Error('ID inválido')
        }
        
        const message = await Message.findById(id)
        
        if (!message) {
            throw new Error('Mensagem não encontrada')
        }
        
        message.delivered = true
        message.deliveredAt = new Date()
        await message.save()
        
        return message.toJSON()
    }
    
    async deleteForUser(id, userId) {
        if (!MessageValidation.validateId(id) || !MessageValidation.validateId(userId)) {
            throw new Error('IDs inválidos')
        }
        
        const message = await Message.findById(id)
        
        if (!message) {
            throw new Error('Mensagem não encontrada')
        }
        
        if (!message.deletedBy.includes(userId)) {
            message.deletedBy.push(userId)
            await message.save()
        }
        
        logger.info(`Mensagem ${id} deletada para usuário ${userId}`)
        
        return { message: 'Mensagem deletada com sucesso' }
    }
}

module.exports = UpdateMessageUseCase