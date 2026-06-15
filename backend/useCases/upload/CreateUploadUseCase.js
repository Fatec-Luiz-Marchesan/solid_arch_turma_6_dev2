const path = require('path')
const fs = require('fs').promises
const { validateFile, validateUploadReference } = require('../../helpers/uploadValidation')

class CreateUploadUseCase {
  constructor(uploadRepository) {
    this.uploadRepository = uploadRepository
  }
  
  async execute(file, referenceData, userId) {
    const fileValidation = validateFile(file)
    if (!fileValidation.isValid) {
      throw new Error(fileValidation.errors.join(', '))
    }
    
    const referenceValidation = validateUploadReference(referenceData)
    if (!referenceValidation.isValid) {
      throw new Error(referenceValidation.errors.join(', '))
    }
    
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}-${file.originalname.replace(/\s/g, '-')}`
    const uploadDir = path.join(__dirname, '../../public/uploads')
    const filePath = path.join(uploadDir, uniqueFileName)
    
    await fs.mkdir(uploadDir, { recursive: true })
    await fs.writeFile(filePath, file.buffer)
    
    const uploadData = {
      originalName: file.originalname,
      fileName: uniqueFileName,
      filePath: `/uploads/${uniqueFileName}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      relatedTo: {
        modelType: referenceData.modelType || 'none',
        modelId: referenceData.modelId || null
      },
      uploadedBy: userId
    }
    
    const upload = await this.uploadRepository.create(uploadData)
    return upload
  }
}

module.exports = CreateUploadUseCase