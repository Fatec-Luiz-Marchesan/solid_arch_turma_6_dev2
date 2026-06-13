const CreateBreedUseCase = require("../useCases/breed/CreateBreedUseCase");
const GetBreedsUseCase = require("../useCases/breed/GetBreedsUseCase");
const GetBreedByIdUseCase = require("../useCases/breed/GetBreedByIdUseCase");
const UpdateBreedUseCase = require("../useCases/breed/UpdateBreedUseCase");
const DeleteBreedUseCase = require("../useCases/breed/DeleteBreedUseCase");

class BreedController {

    async create(req, res) {
        try {
            const breed = await new CreateBreedUseCase().execute(req.body);

            return res.status(201).json(breed);
        } catch (error) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }

    async getAll(req, res) {
        const breeds = await new GetBreedsUseCase().execute();

        return res.status(200).json(breeds);
    }

    async getById(req, res) {
        try {
            const breed = await new GetBreedByIdUseCase()
                .execute(req.params.id);

            return res.status(200).json(breed);
        } catch (error) {
            return res.status(404).json({
                message: error.message,
            });
        }
    }

    async update(req, res) {
        try {
            const breed = await new UpdateBreedUseCase()
                .execute(req.params.id, req.body);

            return res.status(200).json(breed);
        } catch (error) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }

    async delete(req, res) {
        try {
            await new DeleteBreedUseCase()
                .execute(req.params.id);

            return res.status(200).json({
                message: "Breed deleted successfully",
            });
        } catch (error) {
            return res.status(404).json({
                message: error.message,
            });
        }
    }
}

module.exports = new BreedController();