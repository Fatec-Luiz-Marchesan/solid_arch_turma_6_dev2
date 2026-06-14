class CacheAdapter {
    constructor(redisClient) {
        this.redis = redisClient
    }

    async get(key) {
        const data = await this.redis.get(key)
        return data ? JSON.parse(data) : null
    }

    async set(key, value, ttlSegundos = 3600) {
        await this.redis.set(key, JSON.stringify(value), { EX: ttlSegundos })
    }

    async del(key) {
        await this.redis.del(key)
    }

    async clear() {
        await this.redis.flushAll()
    }
}

module.exports = CacheAdapter