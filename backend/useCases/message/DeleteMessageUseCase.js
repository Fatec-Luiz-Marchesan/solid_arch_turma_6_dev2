const Message = require('../../models/Message')
const MessageValidation = require('../../helpers/messageValidation')
const logger = require('../../config/logger')

class DeleteMessageUseCase {
    async execute(id) {
        if (!MessageValidation.validateId(id)) {
            throw new Error('ID inválido')
        }
        
        const message = await Message.findByIdAndDelete(id)
        
        if (!message) {
            throw new Error('Mensagem não encontrada')
        }
        
        logger.info(`Mensagem deletada permanentemente: ${id}`)
        
        return { message: 'Mensagem deletada com sucesso' }
    }
}

module.exports = DeleteMessageUseCase