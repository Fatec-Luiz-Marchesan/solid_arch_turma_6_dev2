const MemoryAdapter = require('./MemoryAdapter')

let cacheInstance = null

async function getCacheAdapter() {
    if (!cacheInstance) {
        cacheInstance = new MemoryAdapter()
        console.log('Cache em memória ativo')
    }
    return cacheInstance
}

module.exports = { getCacheAdapter }