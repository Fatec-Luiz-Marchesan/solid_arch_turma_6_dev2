const Message = require('../../models/Message')
const MessageValidation = require('../../helpers/messageValidation')

class GetMessageUseCase {
    async execute(id) {
        if (!MessageValidation.validateId(id)) {
            throw new Error('ID inválido')
        }
        
        const message = await Message.findById(id)
        
        if (!message) {
            throw new Error('Mensagem não encontrada')
        }
        
        return message.toJSON()
    }
    
    async getConversation(userId1, userId2, page = 1, limit = 50) {
        if (!MessageValidation.validateId(userId1) || !MessageValidation.validateId(userId2)) {
            throw new Error('IDs inválidos')
        }
        
        const pageNum = parseInt(page, 10)
        const limitNum = parseInt(limit, 10)
        
        const messages = await Message.find({
            $or: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 }
            ],
            deletedBy: { $nin: [userId1, userId2] }
        })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .sort({ createdAt: -1 })
        
        const total = await Message.countDocuments({
            $or: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 }
            ],
            deletedBy: { $nin: [userId1, userId2] }
        })
        
        return {
            messages: messages.map(m => m.toJSON()),
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        }
    }
    
    async getUnreadCount(userId) {
        if (!MessageValidation.validateId(userId)) {
            throw new Error('userId inválido')
        }
        
        const count = await Message.countDocuments({
            receiverId: userId,
            read: false,
            deletedBy: { $nin: [userId] }
        })
        
        return { unreadCount: count }
    }
}

module.exports = GetMessageUseCase