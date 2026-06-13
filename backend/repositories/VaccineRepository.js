const Vaccine = require('../models/Vaccine');

class VaccineRepository {
  async create(data) {
    const vaccine = await Vaccine.create(data);
    return vaccine;
  }

  async findById(id) {
    const vaccine = await Vaccine.findById(id);
    return vaccine;
  }

  async findByPetId(petId) {
    const vaccines = await Vaccine.find({ pet: petId });
    return vaccines;
  }

  async findAll(filters = {}) {
    const vaccines = await Vaccine.find(filters);
    return vaccines;
  }

  async update(id, data) {
    const vaccine = await Vaccine.findByIdAndUpdate(id, data, { new: true });
    return vaccine;
  }

  async delete(id) {
    const vaccine = await Vaccine.findByIdAndDelete(id);
    return vaccine;
  }
}

module.exports = new VaccineRepository();