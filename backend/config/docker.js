class DockerConfig {
  getMongoURI() {
    if (process.env.DOCKER_ENV === 'true') {
      return 'mongodb://mongodb:27017/petsystem'
    }
    return 'mongodb://localhost:27017/getapetref'
  }
}

module.exports = new DockerConfig()