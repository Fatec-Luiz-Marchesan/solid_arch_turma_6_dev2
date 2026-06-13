const Vaccine = require('../../models/Vaccine')

class UpdateVaccineUseCase {
  async execute(id, data) {
    const allowedFields = [
      'name',
      'description',
      'laboratory',
      'doses',
      'interval',
      'available',
    ]

    const filteredData = {}

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        filteredData[field] = data[field]
      }
    })

    return await Vaccine.findByIdAndUpdate(
      id,
      {
        $set: filteredData,
      },
      {
        new: true,
        runValidators: true,
      }
    )
  }
}

module.exports = UpdateVaccineUseCase