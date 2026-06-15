const mongoose = require("mongoose");
const Breed = require("../../models/Breed");

class UpdateBreedUseCase {
    async execute(id, data) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid ID format");
        }
        const allowedFields = ["name", "species", "description"];
        const filteredData = {};
        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                filteredData[field] = data[field];
            }
        });
        const breed = await Breed.findByIdAndUpdate(
            id,
            { $set: filteredData },
            { new: true, runValidators: true }
        );
        if (!breed) {
            throw new Error("Breed not found");
        }
        return breed;
    }
}

module.exports = UpdateBreedUseCase;
