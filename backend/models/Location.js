const mongoose = require('mongoose')

const LocationSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: [true, 'Pet ID é obrigatório'],
    },
    cep: {
        type: String,
        required: [true, 'CEP é obrigatório'],
        validate: {
            validator: function (v) {
                return /^[0-9]{5}-?[0-9]{3}$/.test(v)
            },
            message: 'CEP inválido',
        },
    },
    cidade: {
        type: String,
        required: [true, 'Cidade é obrigatória'],
    },
    estado: {
        type: String,
        required: [true, 'Estado é obrigatório'],
        uppercase: true,
        minlength: 2,
        maxlength: 2,
    },
    bairro: String,
    rua: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('Location', LocationSchema)
