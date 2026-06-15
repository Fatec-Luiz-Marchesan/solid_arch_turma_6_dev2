const mongoose = require('mongoose')
mongoose.set("strictQuery", false)
const dockerConfig = require('../config/docker')

async function main() {
  const uri = dockerConfig.getMongoURI()
  await mongoose.connect(uri)
  console.log('Conectou com Mongoose!')
}

main().catch((err) => console.log(err))

module.exports = mongoose