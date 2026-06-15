const mongoose = require("mongoose");

const BreedSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },

    species: {
        type: String,
        required: true,
        enum: ["dog", "cat"],
    },

    description: {
        type: String,
        default: "",
    },
},
{
    timestamps: true,
});

module.exports = mongoose.model("Breed", BreedSchema);