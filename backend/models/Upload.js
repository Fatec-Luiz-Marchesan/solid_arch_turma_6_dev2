const mongoose = require('mongoose')

const UploadSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true,
    unique: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  relatedTo: {
    modelType: {
      type: String,
      enum: ['pet', 'user', 'vaccine', 'none'],
      default: 'none'
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedTo.modelType'
    }
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Upload', UploadSchema)