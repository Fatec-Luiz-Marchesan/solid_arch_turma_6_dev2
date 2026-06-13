// helpers/breedValidation.js

const validateBreed = ({ name, species }) => {

    if (!name || typeof name !== "string") {
        return "Breed name is required";
    }

    if (!species) {
        return "Species is required";
    }

    const validSpecies = ["dog", "cat"];

    if (!validSpecies.includes(species)) {
        return "Invalid species";
    }

    return null;
};

module.exports = validateBreed;