const express = require('express')
const DockerController = require('../controllers/DockerController')

const router = express.Router()

router.get('/status', (req, res) => DockerController.status(req, res))
router.get('/info', (req, res) => DockerController.info(req, res))

module.exports = router