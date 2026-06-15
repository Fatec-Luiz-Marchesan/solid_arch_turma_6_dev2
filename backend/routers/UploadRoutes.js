const express = require('express')
const multer = require('multer')
const UploadController = require('../controllers/UploadController')
const verifyToken = require('../helpers/verifyToken')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/', verifyToken, upload.single('file'), (req, res) => UploadController.create(req, res))
router.get('/', verifyToken, (req, res) => UploadController.list(req, res))
router.get('/:id', verifyToken, (req, res) => UploadController.getById(req, res))
router.delete('/:id', verifyToken, (req, res) => UploadController.delete(req, res))

module.exports = router