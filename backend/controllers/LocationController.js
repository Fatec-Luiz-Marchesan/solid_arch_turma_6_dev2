const CreateLocationUseCase = require('../useCases/location/CreateLocationUseCase')
const GetLocationUseCase = require('../useCases/location/GetLocationUseCase')
const UpdateLocationUseCase = require('../useCases/location/UpdateLocationUseCase')
const DeleteLocationUseCase = require('../useCases/location/DeleteLocationUseCase')

const createUC = new CreateLocationUseCase()
const getUC = new GetLocationUseCase()
const updateUC = new UpdateLocationUseCase()
const deleteUC = new DeleteLocationUseCase()

class LocationController {
    async create(req, res) {
        try {
            const location = await createUC.execute(req.body)
            res.status(201).json({ message: 'Localização criada com sucesso', location })
        } catch (error) {
            if (error.message.includes('obrigatório') || error.message.includes('entre')) {
                res.status(422).json({ message: error.message })
            } else if (error.message.includes('já existe')) {
                res.status(409).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
    
    async getById(req, res) {
        try {
            const location = await getUC.execute(req.params.id)
            res.status(200).json(location)
        } catch (error) {
            if (error.message === 'ID inválido') {
                res.status(422).json({ message: error.message })
            } else if (error.message === 'Localização não encontrada') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
    
    async getByPetId(req, res) {
        try {
            const location = await getUC.findByPetId(req.params.petId)
            res.status(200).json(location)
        } catch (error) {
            if (error.message === 'petId inválido') {
                res.status(422).json({ message: error.message })
            } else if (error.message === 'Localização não encontrada para este pet') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
    
    async getAll(req, res) {
        try {
            const { page, limit, isCurrent, city } = req.query
            const result = await getUC.findAll(page, limit, { isCurrent, city })
            res.status(200).json(result)
        } catch (error) {
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }
    
    async getNearby(req, res) {
        try {
            const { lat, lng, maxDistance } = req.query
            const locations = await getUC.getNearby(parseFloat(lat), parseFloat(lng), maxDistance)
            res.status(200).json(locations)
        } catch (error) {
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }
    
    async update(req, res) {
        try {
            const location = await updateUC.execute(req.params.id, req.body)
            res.status(200).json({ message: 'Localização atualizada com sucesso', location })
        } catch (error) {
            if (error.message.includes('inválido') || error.message.includes('entre')) {
                res.status(422).json({ message: error.message })
            } else if (error.message === 'Localização não encontrada') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
    
    async delete(req, res) {
        try {
            const result = await deleteUC.execute(req.params.id)
            res.status(200).json(result)
        } catch (error) {
            if (error.message === 'ID inválido') {
                res.status(422).json({ message: error.message })
            } else if (error.message === 'Localização não encontrada') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
}

module.exports = new LocationController()