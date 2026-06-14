class MemoryAdapter {
    constructor() {
        this.cache = new Map()
    }

    async get(key) {
        const item = this.cache.get(key)
        if (!item) return null

        if (item.expiry && Date.now() > item.expiry) {
            this.cache.delete(key)
            return null
        }

        return item.value
    }

    async set(key, value, ttlSegundos = 3600) {
        const expiry = Date.now() + (ttlSegundos * 1000)
        this.cache.set(key, { value, expiry })
    }

    async del(key) {
        this.cache.delete(key)
    }

    async clear() {
        this.cache.clear()
    }
}

module.exports = MemoryAdapter