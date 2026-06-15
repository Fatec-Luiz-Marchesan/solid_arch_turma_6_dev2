const mongoose = require("mongoose");

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

const validateBreedId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
    }
    return true;
};

module.exports = { validateBreed, validateBreedId };
