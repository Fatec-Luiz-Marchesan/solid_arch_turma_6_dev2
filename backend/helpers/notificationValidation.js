const mongoose = require('mongoose')

function validateNotification(data) {
    const errors = []
    
    if (!data.title || data.title.length < 3) {
        errors.push('Título deve ter pelo menos 3 caracteres')
    }
    
    if (!data.message || data.message.length < 5) {
        errors.push('Mensagem deve ter pelo menos 5 caracteres')
    }
    
    if (!data.recipient) {
        errors.push('Destinatário é obrigatório')
    }
    
    if (data.recipient && !mongoose.Types.ObjectId.isValid(data.recipient)) {
        errors.push('ID do destinatário inválido')
    }
    
    if (data.sender && !mongoose.Types.ObjectId.isValid(data.sender)) {
        errors.push('ID do remetente inválido')
    }
    
    if (data.scheduledFor && new Date(data.scheduledFor) < new Date()) {
        errors.push('Data agendada não pode ser no passado')
    }
    
    if (data.expiresAt && data.scheduledFor && new Date(data.expiresAt) < new Date(data.scheduledFor)) {
        errors.push('Data de expiração deve ser após data agendada')
    }
    
    return { isValid: errors.length === 0, errors }
}

function validateId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID inválido')
    }
    return true
}

module.exports = { validateNotification, validateId }
