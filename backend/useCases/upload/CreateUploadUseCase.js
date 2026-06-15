const path = require('path')
const fs = require('fs').promises
const { v4: uuidv4 } = require('uuid')
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
    
    const fileExt = path.extname(file.originalname).toLowerCase()
    const safeFileName = `${uuidv4()}${fileExt}`
    const uploadDir = path.join(__dirname, '../../public/uploads')
    const safePath = path.resolve(uploadDir)
    const filePath = path.join(safePath, safeFileName)
    
    if (!filePath.startsWith(safePath)) {
      throw new Error('Caminho de arquivo inválido')
    }
    
    await fs.mkdir(safePath, { recursive: true })
    await fs.writeFile(filePath, file.buffer)
    
    const uploadData = {
      originalName: path.basename(file.originalname),
      fileName: safeFileName,
      filePath: `/uploads/${safeFileName}`,
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