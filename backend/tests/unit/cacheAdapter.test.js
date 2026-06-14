const CacheAdapter = require('../../adapters/cache/CacheAdapter')

class MockRedis {
    constructor() {
        this.store = new Map()
    }

    async get(key) {
        const item = this.store.get(key)
        return item ? item.value : null
    }

    async set(key, value, options) {
        this.store.set(key, { value, options })
    }

    async del(key) {
        this.store.delete(key)
    }

    async flushAll() {
        this.store.clear()
    }
}

describe('CacheAdapter', () => {
    let cacheAdapter
    let mockRedis

    beforeEach(() => {
        mockRedis = new MockRedis()
        cacheAdapter = new CacheAdapter(mockRedis)
    })

    test('deve salvar e recuperar dados do cache', async () => {
        const dados = { nome: 'teste', id: 1 }
        await cacheAdapter.set('chave:1', dados, 60)

        const resultado = await cacheAdapter.get('chave:1')
        expect(resultado).toEqual(dados)
    })

    test('deve retornar null para chave inexistente', async () => {
        const resultado = await cacheAdapter.get('chave:inexistente')
        expect(resultado).toBeNull()
    })

    test('deve deletar chave especifica', async () => {
        await cacheAdapter.set('chave:1', 'valor', 60)
        await cacheAdapter.del('chave:1')

        const resultado = await cacheAdapter.get('chave:1')
        expect(resultado).toBeNull()
    })
})