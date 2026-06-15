const express = require('express')
const multer = require('multer')
const rateLimit = require('express-rate-limit')
const UploadController = require('../controllers/UploadController')
const verifyToken = require('../helpers/verifyToken')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitos uploads. Tente novamente em 15 minutos' }
})

const listLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { error: 'Muitas requisições. Tente novamente em 1 minuto' }
})

router.post('/', verifyToken, uploadLimiter, upload.single('file'), (req, res) => UploadController.create(req, res))
router.get('/', verifyToken, listLimiter, (req, res) => UploadController.list(req, res))
router.get('/:id', verifyToken, listLimiter, (req, res) => UploadController.getById(req, res))
router.delete('/:id', verifyToken, uploadLimiter, (req, res) => UploadController.delete(req, res))

module.exports = router