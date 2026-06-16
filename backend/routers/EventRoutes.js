const router = require('express').Router();
const EventController = require('../controllers/EventController');
const checkToken = require('../helpers/check-token');
const rateLimiter = require('../config/rateLimiter');

router.use(rateLimiter); 

router.post('/', checkToken, EventController.create);
router.get('/', checkToken, EventController.getUserEvents); 
router.get('/:id', checkToken, EventController.getById);
router.put('/:id', checkToken, EventController.update);
router.put('/:id/cancel', checkToken, EventController.cancel);

module.exports = router;