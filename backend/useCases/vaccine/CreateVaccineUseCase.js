// useCases/vaccine/CreateVaccineUseCase.js

const Vaccine = require("../../models/Vaccine");

class CreateVaccineUseCase {

    async execute(data) {

        const vaccine = await Vaccine.create(data);

        return vaccine;
    }
}

module.exports = CreateVaccineUseCase;