const mongoose = require("mongoose");
const Breed = require("../../models/Breed");

class DeleteBreedUseCase {
    async execute(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid ID format");
        }
        const breed = await Breed.findByIdAndDelete(id);
        if (!breed) {
            throw new Error("Breed not found");
        }
        return breed;
    }
}

module.exports = DeleteBreedUseCase;
