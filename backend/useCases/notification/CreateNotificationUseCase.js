const mongoose = require('mongoose')
const Notification = require('../../models/Notification')
const { validateNotification } = require('../../helpers/notificationValidation')
const logger = require('../../config/logger')

class CreateNotificationUseCase {
    async execute(data) {
        const validation = validateNotification(data)
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '))
        }
        
        const notification = new Notification(data)
        await notification.save()
        
        logger.info(`Notificação criada para: ${data.recipient}`)
        
        return notification.toJSON()
    }
}

module.exports = CreateNotificationUseCase
