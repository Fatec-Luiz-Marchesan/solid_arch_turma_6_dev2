// controllers/VaccineController.js

const validateVaccine = require("../helpers/vaccineValidation");

const CreateVaccineUseCase = require("../useCases/vaccine/CreateVaccineUseCase");
const GetVaccineUseCase = require("../useCases/vaccine/GetVaccineUseCase");
const UpdateVaccineUseCase = require("../useCases/vaccine/UpdateVaccineUseCase");
const DeleteVaccineUseCase = require("../useCases/vaccine/DeleteVaccineUseCase");

class VaccineController {

    async create(req, res) {

        const errors = validateVaccine(req.body);

        if (errors.length) {
            return res.status(422).json({ errors });
        }

        const useCase = new CreateVaccineUseCase();

        const vaccine = await useCase.execute(req.body);

        return res.status(201).json(vaccine);
    }

    async getAll(req, res) {

        const useCase = new GetVaccineUseCase();

        const vaccines = await useCase.execute();

        return res.status(200).json(vaccines);
    }

    async update(req, res) {

        const useCase = new UpdateVaccineUseCase();

        const vaccine = await useCase.execute(
            req.params.id,
            req.body
        );

        return res.status(200).json(vaccine);
    }

    async delete(req, res) {

        const useCase = new DeleteVaccineUseCase();

        await useCase.execute(req.params.id);

        return res.status(200).json({
            message: "Vaccine removed"
        });
    }
}

module.exports = new VaccineController();