const Breed = require("../../models/Breed");

class GetBreedsUseCase {

    async execute() {
        return await Breed.find();
    }
}

module.exports = GetBreedsUseCase;