const path = require('path')
const fs = require('fs').promises

class DeleteUploadUseCase {
  constructor(uploadRepository) {
    this.uploadRepository = uploadRepository
  }
  
  async execute(id, userId) {
    const upload = await this.uploadRepository.findById(id)
    
    if (!upload) {
      throw new Error('Upload não encontrado')
    }
    
    if (upload.uploadedBy.toString() !== userId) {
      throw new Error('Não autorizado')
    }
    
    const filePath = path.join(__dirname, '../../public', upload.filePath)
    try {
      await fs.unlink(filePath)
    } catch (err) {
      console.log('Arquivo não encontrado no disco')
    }
    
    await this.uploadRepository.delete(id)
    return { message: 'Upload removido com sucesso' }
  }
}

module.exports = DeleteUploadUseCase