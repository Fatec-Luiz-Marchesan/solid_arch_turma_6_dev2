

const Vaccine = require("../../models/Vaccine");

class UpdateVaccineUseCase {

    async execute(id, data) {

        return await Vaccine.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );
    }
}

module.exports = UpdateVaccineUseCase;