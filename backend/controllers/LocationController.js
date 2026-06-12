
const Location = require('../models/Location')
const Pet = require('../models/Pet')
const axios = require('axios')
const mongoose = require('mongoose')

module.exports = class LocationController {
  
  static async create(req, res) {
    try {
      let { petId, cep } = req.body

      if (!petId) {
        return res.status(422).json({ message: 'Pet ID é obrigatório!' })
      }

      if (!mongoose.Types.ObjectId.isValid(petId)) {
        return res.status(400).json({ message: 'Pet ID inválido!' })
      }

      if (!cep) {
        return res.status(422).json({ message: 'CEP é obrigatório!' })
      }

      const sanitizedCep = String(cep).replace(/\D/g, '')
      if (!/^\d{8}$/.test(sanitizedCep)) {
        return res.status(422).json({ message: 'CEP inválido!' })
      }

      const pet = await Pet.findById(petId)
      if (!pet) {
        return res.status(404).json({ message: 'Pet não encontrado!' })
      }

      const response = await axios.get(`https://viacep.com.br/ws/${sanitizedCep}/json/`)
      
      if (response.data.erro) {
        return res.status(422).json({ message: 'CEP inválido!' })
      }

      const location = new Location({
        petId,
        cep: sanitizedCep,
        cidade: response.data.localidade,
        estado: response.data.uf,
        bairro: response.data.bairro,
        rua: response.data.logradouro,
      })

      await location.save()
      res.status(201).json({ message: 'Localização salva com sucesso!', location })
    } catch (error) {
      res.status(500).json({ message: 'Erro ao salvar localização', error: error.message })
    }
  }

  static async getByPet(req, res) {
    try {
      const { petId } = req.params
      const locations = await Location.find({ petId }).sort({ createdAt: -1 })
      res.status(200).json({ locations })
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar localizações' })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      const location = await Location.findById(id)
      if (!location) {
        return res.status(404).json({ message: 'Localização não encontrada!' })
      }
      res.status(200).json({ location })
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar localização' })
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params
      const location = await Location.findByIdAndDelete(id)
      if (!location) {
        return res.status(404).json({ message: 'Localização não encontrada!' })
      }
      res.status(200).json({ message: 'Localização removida com sucesso!' })
    } catch (error) {
      res.status(500).json({ message: 'Erro ao deletar localização' })
    }
  }
}