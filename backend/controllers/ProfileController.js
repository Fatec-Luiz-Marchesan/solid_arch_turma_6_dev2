const CreateProfileUseCase = require('../useCases/profile/CreateProfileUseCase')
const GetProfileUseCase = require('../useCases/profile/GetProfileUseCase')
const UpdateProfileUseCase = require('../useCases/profile/UpdateProfileUseCase')
const DeleteProfileUseCase = require('../useCases/profile/DeleteProfileUseCase')

const createUC = new CreateProfileUseCase()
const getUC = new GetProfileUseCase()
const updateUC = new UpdateProfileUseCase()
const deleteUC = new DeleteProfileUseCase()

class ProfileController {
    async create(req, res) {
        try {
            const profile = await createUC.execute(req.body)
            res.status(201).json({ message: 'Profile criado com sucesso', profile })
        } catch (error) {
            if (error.message.includes('obrigatório') || error.message.includes('mínimo')) {
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
            const profile = await getUC.execute(req.params.id)
            res.status(200).json(profile)
        } catch (error) {
            if (error.message === 'ID inválido') {
                res.status(422).json({ message: error.message })
            } else if (error.message === 'Profile não encontrado') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }

    async getByUserId(req, res) {
        try {
            const profile = await getUC.findByUserId(req.params.userId)
            res.status(200).json(profile)
        } catch (error) {
            if (error.message === 'userId inválido') {
                res.status(422).json({ message: error.message })
            } else if (error.message === 'Profile não encontrado para este usuário') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }

    async getAll(req, res) {
        try {
            const { page, limit, isPublic, city } = req.query
            const result = await getUC.findAll({ isPublic, city }, page, limit)
            res.status(200).json(result)
        } catch (error) {
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    async update(req, res) {
        try {
            const profile = await updateUC.execute(req.params.id, req.body)
            res.status(200).json({ message: 'Profile atualizado com sucesso', profile })
        } catch (error) {
            if (error.message.includes('inválido') || error.message.includes('mínimo')) {
                res.status(422).json({ message: error.message })
            } else if (error.message === 'Profile não encontrado') {
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
            } else if (error.message === 'Profile não encontrado') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }

    async deleteByUserId(req, res) {
        try {
            const result = await deleteUC.deleteByUserId(req.params.userId)
            res.status(200).json(result)
        } catch (error) {
            if (error.message === 'userId inválido') {
                res.status(422).json({ message: error.message })
            } else if (error.message === 'Profile não encontrado para este usuário') {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: 'Erro interno do servidor' })
            }
        }
    }
}

module.exports = new ProfileController()