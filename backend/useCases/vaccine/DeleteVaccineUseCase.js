// useCases/vaccine/DeleteVaccineUseCase.js

const Vaccine = require("../../models/Vaccine");

class DeleteVaccineUseCase {

    async execute(id) {

        return await Vaccine.findByIdAndDelete(id);
    }
}

module.exports = DeleteVaccineUseCase;