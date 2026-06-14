const { getCacheAdapter } = require('../adapters/cache')

async function cacheMiddleware(req, res, next) {
    const cacheKey = `cache:${req.originalUrl || req.url}`

    try {
        const cache = await getCacheAdapter()
        const cachedData = await cache.get(cacheKey)

        if (cachedData) {
            return res.json({
                fromCache: true,
                data: cachedData
            })
        }

        res.sendResponse = res.json
        res.json = async (body) => {
            if (res.statusCode === 200) {
                await cache.set(cacheKey, body, 300)
            }
            res.sendResponse(body)
        }
        next()
    } catch (error) {
        next()
    }
}

module.exports = cacheMiddleware