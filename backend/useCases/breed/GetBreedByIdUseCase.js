const Breed = require("../../models/Breed");

class GetBreedByIdUseCase {

    async execute(id) {

        const breed = await Breed.findById(id);

        if (!breed) {
            throw new Error("Breed not found");
        }

        return breed;
    }
}

module.exports = GetBreedByIdUseCase;