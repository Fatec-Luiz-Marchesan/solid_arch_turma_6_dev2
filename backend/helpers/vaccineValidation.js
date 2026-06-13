const validateVaccine = (data) => {
  const errors = []

  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required')
  }

  if (!data.manufacturer || data.manufacturer.trim() === '') {
    errors.push('Manufacturer is required')
  }

  if (!data.batchNumber || data.batchNumber.trim() === '') {
    errors.push('Batch number is required')
  }

  const mongoOperators = Object.keys(data).filter((key) =>
    key.startsWith('$')
  )

  if (mongoOperators.length > 0) {
    errors.push('Invalid payload')
  }

  return errors
}

module.exports = validateVaccine