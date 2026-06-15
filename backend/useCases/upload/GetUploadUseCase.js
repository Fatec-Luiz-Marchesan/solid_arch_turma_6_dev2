class GetUploadUseCase {
  constructor(uploadRepository) {
    this.uploadRepository = uploadRepository
  }
  
  async execute(id) {
    const upload = await this.uploadRepository.findById(id)
    
    if (!upload) {
      throw new Error('Upload não encontrado')
    }
    
    return upload
  }
}

module.exports = GetUploadUseCase