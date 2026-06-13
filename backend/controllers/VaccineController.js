const Vaccine = require('../models/Vaccine');
const Pet = require('../models/Pet');
const { getUserByToken } = require('../helpers/get-user-by-token');
const logger = require('../config/logger');

module.exports = {
  async createVaccine(req, res) {
    try {
      const user = await getUserByToken(req);
      const { petId } = req.params;
      const { name, date, nextDueDate, administeredBy } = req.body;

      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ message: 'Pet não encontrado' });
      }
      if (pet.user.toString() !== user._id.toString() && user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      if (!name || !date) {
        return res.status(422).json({ message: 'Nome e data são obrigatórios' });
      }

      const vaccine = new Vaccine({ petId, name, date, nextDueDate, administeredBy });
      await vaccine.save();
      return res.status(201).json({ message: 'Vacina registrada', vaccine });
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ message: 'Erro interno' });
    }
  },

  async listVaccinesByPet(req, res) {
    try {
      const user = await getUserByToken(req);
      const { petId } = req.params;

      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ message: 'Pet não encontrado' });
      }
      if (pet.user.toString() !== user._id.toString() && user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const vaccines = await Vaccine.find({ petId });
      return res.status(200).json(vaccines);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ message: 'Erro interno' });
    }
  },

  async updateVaccine(req, res) {
    try {
      const { id } = req.params;
      const { name, date, nextDueDate, administeredBy } = req.body;

      const vaccine = await Vaccine.findById(id);
      if (!vaccine) {
        return res.status(404).json({ message: 'Vacina não encontrada' });
      }

      if (name) vaccine.name = name;
      if (date) vaccine.date = date;
      if (nextDueDate) vaccine.nextDueDate = nextDueDate;
      if (administeredBy) vaccine.administeredBy = administeredBy;

      await vaccine.save();
      return res.status(200).json({ message: 'Vacina atualizada', vaccine });
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ message: 'Erro interno' });
    }
  },

  async deleteVaccine(req, res) {
    try {
      const { id } = req.params;
      const vaccine = await Vaccine.findById(id);
      if (!vaccine) {
        return res.status(404).json({ message: 'Vacina não encontrada' });
      }
      await vaccine.deleteOne();
      return res.status(200).json({ message: 'Vacina removida' });
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ message: 'Erro interno' });
    }
  }
};
