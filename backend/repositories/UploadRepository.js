const Upload = require('../models/Upload')
const mongoose = require('mongoose')

const ALLOWED_MODEL_TYPES = ['pet', 'user', 'vaccine', 'none']

class UploadRepository {
  async create(uploadData) {
    const upload = new Upload(uploadData)
    return await upload.save()
  }
  
  async findById(id) {
    return await Upload.findById(id).populate('uploadedBy', 'name email')
  }
  
  async findAll(filters = {}) {
    const query = {}
    
    if (filters.modelType) {
      if (!ALLOWED_MODEL_TYPES.includes(filters.modelType)) {
        throw new Error('Tipo de modelo inválido')
      }
      query['relatedTo.modelType'] = filters.modelType
    }
    
    if (filters.uploadedBy) {
      if (!mongoose.Types.ObjectId.isValid(filters.uploadedBy)) {
        throw new Error('ID do usuário inválido')
      }
      query.uploadedBy = filters.uploadedBy
    }
    
    return await Upload.find(query)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email')
  }
  
  async delete(id) {
    return await Upload.findByIdAndDelete(id)
  }
  
  async findByFileName(fileName) {
    return await Upload.findOne({ fileName })
  }
  
  async findByRelatedModel(modelType, modelId) {
    if (!ALLOWED_MODEL_TYPES.includes(modelType)) {
      throw new Error('Tipo de modelo inválido')
    }
    if (!mongoose.Types.ObjectId.isValid(modelId)) {
      throw new Error('ID do modelo inválido')
    }
    return await Upload.find({
      'relatedTo.modelType': modelType,
      'relatedTo.modelId': modelId
    })
  }
}

module.exports = UploadRepository