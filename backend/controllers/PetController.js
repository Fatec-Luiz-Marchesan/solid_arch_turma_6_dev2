const Pet = require('../models/Pet');
const getUserByToken = require('../helpers/get-user-by-token');
const getToken = require('../helpers/get-token');
const ObjectId = require('mongoose').Types.ObjectId;
const logger = require('../config/logger');

class PetController {
  static async create(req, res) {
    try {
      const { name, age, weight, color, description, vaccinated, healthStatus, lastVetVisit } = req.body;
      const images = req.files;

      if (!name || typeof name !== 'string') {
        return res.status(422).json({ message: 'Nome inválido ou não informado!' });
      }

      if (!age || isNaN(parseInt(age))) {
        return res.status(422).json({ message: 'Idade inválida!' });
      }

      const ageNum = parseInt(age);
      if (ageNum < 0) {
        return res.status(422).json({ message: 'A idade não pode ser negativa!' });
      }

      if (!weight || isNaN(parseFloat(weight))) {
        return res.status(422).json({ message: 'Peso inválido!' });
      }

      const weightNum = parseFloat(weight);
      if (weightNum < 0) {
        return res.status(422).json({ message: 'O peso não pode ser negativo!' });
      }

      if (!color || typeof color !== 'string') {
        return res.status(422).json({ message: 'A cor é obrigatória!' });
      }

      if (!images || images.length === 0) {
        return res.status(422).json({ message: 'A imagem é obrigatória!' });
      }

      const token = getToken(req);
      const user = await getUserByToken(token);

      const pet = new Pet({
        name: String(name).trim(),
        age: ageNum,
        weight: weightNum,
        color: String(color).trim(),
        description: description ? String(description).trim() : '',
        vaccinated: vaccinated === 'true' || vaccinated === true,
        healthStatus: ['healthy', 'sick', 'treatment', 'recovering'].includes(healthStatus) ? healthStatus : 'healthy',
        lastVetVisit: lastVetVisit ? new Date(lastVetVisit) : null,
        available: true,
        images: [],
        user: {
          _id: user._id,
          name: user.name,
          image: user.image,
          phone: user.phone
        }
      });

      images.forEach(image => {
        pet.images.push(image.filename);
      });

      const newPet = await pet.save();
      logger.info(`Pet criado: ${newPet.name} por ${user.name}`);

      res.status(201).json({
        message: 'Pet cadastrado com sucesso!',
        pet: newPet
      });
    } catch (error) {
      logger.error(`Erro ao criar pet: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const pets = await Pet.find().sort('-createdAt');
      res.status(200).json({ pets });
    } catch (error) {
      logger.error(`Erro ao buscar pets: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }

  static async getAllUserPets(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);
      const pets = await Pet.find({ 'user._id': user._id });
      res.status(200).json({ pets });
    } catch (error) {
      logger.error(`Erro ao buscar pets do usuário: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }

  static async getAllUserAdoptions(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);
      const pets = await Pet.find({ 'adopter._id': user._id });
      res.status(200).json({ pets });
    } catch (error) {
      logger.error(`Erro ao buscar adoções: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }

  static async getPetById(req, res) {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID inválido!' });
      }

      const pet = await Pet.findById(id);

      if (!pet) {
        return res.status(404).json({ message: 'Pet não encontrado!' });
      }

      res.status(200).json({ pet });
    } catch (error) {
      logger.error(`Erro ao buscar pet: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }

  static async updatePet(req, res) {
    try {
      const { id } = req.params;
      const { name, age, weight, color, description, vaccinated, healthStatus, lastVetVisit, available } = req.body;
      const images = req.files;

      if (!ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID inválido!' });
      }

      const pet = await Pet.findById(id);

      if (!pet) {
        return res.status(404).json({ message: 'Pet não encontrado!' });
      }

      const token = getToken(req);
      const user = await getUserByToken(token);

      if (pet.user._id.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'Você não tem permissão para editar este pet!' });
      }

      const updateData = {};

      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
          return res.status(422).json({ message: 'Nome inválido!' });
        }
        updateData.name = name.trim();
      }

      if (age !== undefined) {
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 0) {
          return res.status(422).json({ message: 'Idade inválida!' });
        }
        updateData.age = ageNum;
      }

      if (weight !== undefined) {
        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum < 0) {
          return res.status(422).json({ message: 'Peso inválido!' });
        }
        updateData.weight = weightNum;
      }

      if (color !== undefined) {
        if (typeof color !== 'string' || color.trim().length === 0) {
          return res.status(422).json({ message: 'Cor inválida!' });
        }
        updateData.color = color.trim();
      }

      if (description !== undefined) {
        if (typeof description !== 'string') {
          return res.status(422).json({ message: 'Descrição inválida!' });
        }
        updateData.description = description.trim();
      }

      if (vaccinated !== undefined) {
        const isVaccinated = vaccinated === 'true' || vaccinated === true || vaccinated === 1 || vaccinated === '1';
        updateData.vaccinated = isVaccinated;
      }

      if (healthStatus !== undefined) {
        const validStatus = ['healthy', 'sick', 'treatment', 'recovering'];
        if (!validStatus.includes(healthStatus)) {
          return res.status(422).json({ message: 'Status de saúde inválido! Use: healthy, sick, treatment ou recovering' });
        }
        updateData.healthStatus = healthStatus;
      }

      if (lastVetVisit !== undefined) {
        if (lastVetVisit !== null && lastVetVisit !== '') {
          const date = new Date(lastVetVisit);
          if (isNaN(date.getTime())) {
            return res.status(422).json({ message: 'Data de visita inválida!' });
          }
          updateData.lastVetVisit = date;
        } else {
          updateData.lastVetVisit = null;
        }
      }

      if (available !== undefined) {
        const isAvailable = available === 'true' || available === true || available === 1 || available === '1';
        updateData.available = isAvailable;
      }

      if (images && images.length > 0) {
        if (!Array.isArray(images)) {
          return res.status(422).json({ message: 'Formato de imagens inválido!' });
        }
        updateData.images = [];
        for (const image of images) {
          if (image && image.filename && typeof image.filename === 'string') {
            updateData.images.push(image.filename);
          }
        }
      }

      await Pet.findByIdAndUpdate(id, updateData);
      const updatedPet = await Pet.findById(id);

      logger.info(`Pet atualizado: ${updatedPet.name}`);

      res.status(200).json({
        message: 'Pet atualizado com sucesso!',
        pet: updatedPet
      });
    } catch (error) {
      logger.error(`Erro ao atualizar pet: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }

  static async deletePet(req, res) {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID inválido!' });
      }

      const pet = await Pet.findById(id);

      if (!pet) {
        return res.status(404).json({ message: 'Pet não encontrado!' });
      }

      const token = getToken(req);
      const user = await getUserByToken(token);

      if (pet.user._id.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'Você não tem permissão para deletar este pet!' });
      }

      await Pet.findByIdAndDelete(id);
      logger.info(`Pet deletado: ${pet.name}`);

      res.status(200).json({ message: 'Pet removido com sucesso!' });
    } catch (error) {
      logger.error(`Erro ao deletar pet: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }

  static async schedule(req, res) {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID inválido!' });
      }

      const pet = await Pet.findById(id);

      if (!pet) {
        return res.status(404).json({ message: 'Pet não encontrado!' });
      }

      const token = getToken(req);
      const user = await getUserByToken(token);

      if (pet.user._id.toString() === user._id.toString()) {
        return res.status(422).json({ message: 'Você não pode agendar uma visita com seu próprio pet!' });
      }

      if (pet.adopter && pet.adopter._id.toString() === user._id.toString()) {
        return res.status(422).json({ message: 'Você já agendou uma visita para este pet!' });
      }

      pet.adopter = {
        _id: user._id,
        name: user.name,
        image: user.image
      };

      await pet.save();
      logger.info(`Visita agendada para o pet ${pet.name} pelo usuário ${user.name}`);

      res.status(200).json({
        message: `Visita agendada! Entre em contato com ${pet.user.name} no telefone: ${pet.user.phone}`
      });
    } catch (error) {
      logger.error(`Erro ao agendar visita: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }

  static async concludeAdoption(req, res) {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID inválido!' });
      }

      const pet = await Pet.findById(id);

      if (!pet) {
        return res.status(404).json({ message: 'Pet não encontrado!' });
      }

      pet.available = false;
      await pet.save();

      logger.info(`Adoção concluída para o pet ${pet.name}`);

      res.status(200).json({
        message: 'Adoção finalizada com sucesso!',
        pet
      });
    } catch (error) {
      logger.error(`Erro ao concluir adoção: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }

  static async getVaccinatedPets(req, res) {
    try {
      const pets = await Pet.find({ vaccinated: true }).sort('-createdAt');
      res.status(200).json({ pets, count: pets.length });
    } catch (error) {
      logger.error(`Erro ao buscar pets vacinados: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }

  static async getPetsByHealthStatus(req, res) {
    try {
      const { status } = req.params;
      const validStatus = ['healthy', 'sick', 'treatment', 'recovering'];

      if (!validStatus.includes(status)) {
        return res.status(422).json({ message: 'Status de saúde inválido! Use: healthy, sick, treatment ou recovering' });
      }

      const pets = await Pet.find({ healthStatus: status }).sort('-createdAt');
      res.status(200).json({ pets, count: pets.length, status });
    } catch (error) {
      logger.error(`Erro ao buscar pets por status: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = PetController;
