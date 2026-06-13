// useCases/vaccine/GetVaccineUseCase.js

const Vaccine = require("../../models/Vaccine");

class GetVaccineUseCase {

    async execute() {

        return await Vaccine.find();
    }
}

module.exports = GetVaccineUseCase;