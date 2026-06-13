const Breed = require("../../models/Breed");

class DeleteBreedUseCase {

    async execute(id) {

        const breed = await Breed.findByIdAndDelete(id);

        if (!breed) {
            throw new Error("Breed not found");
        }

        return breed;
    }
}

module.exports = DeleteBreedUseCase;