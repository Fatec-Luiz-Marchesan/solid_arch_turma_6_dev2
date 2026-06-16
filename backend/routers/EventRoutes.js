const router = require('express').Router();
const EventController = require('../controllers/EventController');
const checkToken = require('../helpers/check-token');

router.post('/', checkToken, EventController.create);
router.get('/', checkToken, EventController.getAll);
router.get('/:id', checkToken, EventController.getById);
router.put('/:id', checkToken, EventController.update);
router.delete('/:id', checkToken, EventController.delete);

module.exports = router;