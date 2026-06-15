const Upload = require('../models/Upload')

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
    if (filters.modelType) query['relatedTo.modelType'] = filters.modelType
    if (filters.uploadedBy) query.uploadedBy = filters.uploadedBy
    
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
    return await Upload.find({
      'relatedTo.modelType': modelType,
      'relatedTo.modelId': modelId
    })
  }
}

module.exports = UploadRepository