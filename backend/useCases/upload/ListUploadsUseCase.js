class ListUploadsUseCase {
  constructor(uploadRepository) {
    this.uploadRepository = uploadRepository
  }
  
  async execute(filters = {}) {
    return await this.uploadRepository.findAll(filters)
  }
}

module.exports = ListUploadsUseCase