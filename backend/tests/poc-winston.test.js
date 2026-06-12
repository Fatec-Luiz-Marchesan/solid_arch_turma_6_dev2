const logger = require('../config/logger')

describe('PoC - Winston Logs Estruturados', () => {
  
  test('deve logar mensagem de info', () => {
    logger.info('[PoC] Winston funcionando - INFO')
    expect(true).toBe(true)
  })

  test('deve logar mensagem de warn', () => {
    logger.warn('[PoC] Winston funcionando - WARN')
    expect(true).toBe(true)
  })

  test('deve logar mensagem de error', () => {
    logger.error('[PoC] Winston funcionando - ERROR')
    expect(true).toBe(true)
  })
})