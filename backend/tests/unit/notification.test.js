const Notification = require('../../models/Notification')
const { validateNotification, validateId } = require('../../helpers/notificationValidation')
const CreateNotificationUseCase = require('../../useCases/notification/CreateNotificationUseCase')

describe('Notification Validation', () => {
    test('valida notificacao correta', () => {
        const data = {
            title: 'Consulta Veterinária',
            message: 'Sua consulta está marcada para amanhã',
            recipient: '123456789012345678901234'
        }
        const result = validateNotification(data)
        expect(result.isValid).toBe(true)
    })
    
    test('rejeita titulo curto', () => {
        const data = {
            title: 'Oi',
            message: 'Mensagem de teste',
            recipient: '123456789012345678901234'
        }
        const result = validateNotification(data)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Título deve ter pelo menos 3 caracteres')
    })
    
    test('rejeita sem destinatario', () => {
        const data = {
            title: 'Teste',
            message: 'Mensagem'
        }
        const result = validateNotification(data)
        expect(result.isValid).toBe(false)
    })
})

describe('Task 19 - Novos campos do Notification', () => {
    test('deve criar notificacao com channel', () => {
        const data = {
            title: 'Teste',
            message: 'Mensagem de teste',
            recipient: '123456789012345678901234',
            channel: 'email'
        }
        const notification = new Notification(data)
        expect(notification.channel).toBe('email')
    })
    
    test('deve criar notificacao com deliveryStatus', () => {
        const data = {
            title: 'Teste',
            message: 'Mensagem',
            recipient: '123456789012345678901234',
            deliveryStatus: 'pending'
        }
        const notification = new Notification(data)
        expect(notification.deliveryStatus).toBe('pending')
    })
    
    test('deve criar notificacao com reminder', () => {
        const data = {
            title: 'Teste',
            message: 'Mensagem',
            recipient: '123456789012345678901234',
            reminder: { enabled: true, interval: 30, unit: 'minutes' }
        }
        const notification = new Notification(data)
        expect(notification.reminder.enabled).toBe(true)
    })
    
    test('deve criar notificacao com category', () => {
        const data = {
            title: 'Teste',
            message: 'Mensagem',
            recipient: '123456789012345678901234',
            category: 'medical'
        }
        const notification = new Notification(data)
        expect(notification.category).toBe('medical')
    })
    
    test('deve criar notificacao com attachments', () => {
        const data = {
            title: 'Teste',
            message: 'Mensagem',
            recipient: '123456789012345678901234',
            attachments: [{ name: 'doc.pdf', url: 'http://teste.com', type: 'pdf' }]
        }
        const notification = new Notification(data)
        expect(notification.attachments).toBeDefined()
        expect(notification.attachments.length).toBe(1)
    })
})

console.log('Testes do Notification finalizados!')
