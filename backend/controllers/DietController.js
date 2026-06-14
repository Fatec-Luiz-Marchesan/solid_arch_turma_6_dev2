const CreateDietUseCase = require('../useCases/diet/CreateDietUseCase')
const GetDietUseCase = require('../useCases/diet/GetDietUseCase')
const UpdateDietUseCase = require('../useCases/diet/UpdateDietUseCase')
const DeleteDietUseCase = require('../useCases/diet/DeleteDietUseCase')

const createUC = new CreateDietUseCase()
const getUC = new GetDietUseCase()
const updateUC = new UpdateDietUseCase()
const deleteUC = new DeleteDietUseCase()

class DietController {
    async create(req, res) {
        try {
            const diet = await createUC.execute(req.body)
            res.status(201).json({ message: 'Dieta criada com sucesso', diet })
        } catch (error) {
            if (error.message.includes('obrigatório')) {
                res.status(422).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
    
    async getById(req, res) {
        try {
            const diet = await getUC.execute(req.params.id)
            res.status(200).json(diet)
        } catch (error) {
            if (error.message === 'ID inválido') {
                res.status(422).json({ message: error.message })
            } else if (error.message === 'Dieta não encontrada') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
    
    async getByPetId(req, res) {
        try {
            const diets = await getUC.findByPetId(req.params.petId)
            res.status(200).json(diets)
        } catch (error) {
            if (error.message === 'petId inválido') {
                res.status(422).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
    
    async getAll(req, res) {
        try {
            const { page, limit, isActive } = req.query
            const result = await getUC.findAll(page, limit, { isActive })
            res.status(200).json(result)
        } catch (error) {
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }
    
    async update(req, res) {
        try {
            const diet = await updateUC.execute(req.params.id, req.body)
            res.status(200).json({ message: 'Dieta atualizada com sucesso', diet })
        } catch (error) {
            if (error.message.includes('inválido') || error.message.includes('obrigatório')) {
                res.status(422).json({ message: error.message })
            } else if (error.message === 'Dieta não encontrada') {
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
            } else if (error.message === 'Dieta não encontrada') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
}

module.exports = new DietController()