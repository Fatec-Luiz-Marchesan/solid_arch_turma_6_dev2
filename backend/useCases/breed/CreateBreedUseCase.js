const Breed = require("../../models/Breed");
const validateBreed = require("../../helpers/breedValidation");

class CreateBreedUseCase {

    async execute(data) {

        const error = validateBreed(data);

        if (error) {
            throw new Error(error);
        }

        const breed = await Breed.create(data);

        return breed;
    }
}

module.exports = CreateBreedUseCase;