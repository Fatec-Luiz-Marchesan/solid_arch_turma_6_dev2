const mongoose = require('mongoose')

class DockerController {
  async status(req, res) {
    const isDocker = process.env.DOCKER_ENV === 'true'
    
    res.json({
      docker: isDocker,
      node: process.version,
      mongodb: mongoose.connection.readyState === 1,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      porta: 5000
    })
  }

  async info(req, res) {
    res.json({
      ambiente: process.env.DOCKER_ENV === 'true' ? 'docker' : 'local',
      mongodb_uri: process.env.DOCKER_ENV === 'true' ? 'mongodb://mongodb:27017/getapetref' : 'mongodb://localhost:27017/getapetref'
    })
  }
}

module.exports = new DockerController()