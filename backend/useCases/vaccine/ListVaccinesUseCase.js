const repo = require('../../repositories/VaccineRepository');

class ListVaccinesUseCase {
  async execute(filters = {}) {
  
    if (filters.petId) {
      return repo.findByPetId(filters.petId);
    }
    
    if (filters.pet) {
      return repo.findByPetId(filters.pet);
    }

    return repo.findAll(filters);
  }
}

module.exports = new ListVaccinesUseCase();