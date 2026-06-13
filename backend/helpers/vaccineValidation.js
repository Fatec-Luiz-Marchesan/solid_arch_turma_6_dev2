// helpers/vaccineValidation.js

const validateVaccine = (data) => {

    const errors = [];

    if (!data.name || data.name.trim() === "") {
        errors.push("Name is required");
    }

    if (!data.manufacturer || data.manufacturer.trim() === "") {
        errors.push("Manufacturer is required");
    }

    if (
        data.doses === undefined ||
        data.doses === null ||
        data.doses < 1
    ) {
        errors.push("Doses must be greater than zero");
    }

    return errors;
};

module.exports = validateVaccine;