const UploadRepository = require('../repositories/UploadRepository')
const CreateUploadUseCase = require('../useCases/upload/CreateUploadUseCase')
const ListUploadsUseCase = require('../useCases/upload/ListUploadsUseCase')
const DeleteUploadUseCase = require('../useCases/upload/DeleteUploadUseCase')
const GetUploadUseCase = require('../useCases/upload/GetUploadUseCase')

const uploadRepository = new UploadRepository()

class UploadController {
  async create(req, res) {
    try {
      const userId = req.userId
      const { modelType, modelId } = req.body
      
      const createUpload = new CreateUploadUseCase(uploadRepository)
      const upload = await createUpload.execute(req.file, { modelType, modelId }, userId)
      
      res.status(201).json({
        success: true,
        message: 'Upload realizado com sucesso',
        data: upload
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      })
    }
  }
  
  async list(req, res) {
    try {
      const { modelType, uploadedBy } = req.query
      const listUploads = new ListUploadsUseCase(uploadRepository)
      const uploads = await listUploads.execute({ modelType, uploadedBy })
      
      res.json({
        success: true,
        data: uploads
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      })
    }
  }
  
  async getById(req, res) {
    try {
      const { id } = req.params
      const getUpload = new GetUploadUseCase(uploadRepository)
      const upload = await getUpload.execute(id)
      
      res.json({
        success: true,
        data: upload
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      })
    }
  }
  
  async delete(req, res) {
    try {
      const { id } = req.params
      const userId = req.userId
      
      const deleteUpload = new DeleteUploadUseCase(uploadRepository)
      const result = await deleteUpload.execute(id, userId)
      
      res.json({
        success: true,
        message: result.message
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      })
    }
  }
}

module.exports = new UploadController()