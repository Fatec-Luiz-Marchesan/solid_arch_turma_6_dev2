const MemoryAdapter = require('../adapters/cache/MemoryAdapter')

class CacheConfig {
    static async getClient() {
        const cache = new MemoryAdapter()
        console.log('Cache em memória configurado')
        return cache
    }
}

module.exports = CacheConfig