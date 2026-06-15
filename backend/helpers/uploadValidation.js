const validator = require('validator')

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'application/pdf']
const MAX_SIZE = 5 * 1024 * 1024

function validateFile(file) {
  const errors = []
  
  if (!file) {
    errors.push('Arquivo não enviado')
    return { isValid: false, errors }
  }
  
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    errors.push('Tipo de arquivo não permitido')
  }
  
  if (file.size > MAX_SIZE) {
    errors.push(`Arquivo muito grande. Máximo: ${MAX_SIZE / 1024 / 1024}MB`)
  }
  
  if (!file.originalname || file.originalname.length < 1) {
    errors.push('Nome do arquivo inválido')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

function validateUploadReference(data) {
  const errors = []
  
  if (data.modelType && data.modelType !== 'none') {
    if (!data.modelId) {
      errors.push('ID do modelo referenciado é obrigatório')
    }
    
    if (!validator.isMongoId(data.modelId.toString())) {
      errors.push('ID do modelo inválido')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

module.exports = {
  validateFile,
  validateUploadReference,
  ALLOWED_TYPES,
  MAX_SIZE
}