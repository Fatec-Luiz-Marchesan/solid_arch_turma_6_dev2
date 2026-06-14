const Message = require('../../models/Message')
const MessageValidation = require('../../helpers/messageValidation')
const logger = require('../../config/logger')

class CreateMessageUseCase {
    async execute(data) {
        const validation = MessageValidation.validateCreate(data)
        
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '))
        }
        
        const message = new Message(data)
        await message.save()
        
        logger.info(`Mensagem criada de ${data.senderId} para ${data.receiverId}`)
        
        return message.toJSON()
    }
}

module.exports = CreateMessageUseCase