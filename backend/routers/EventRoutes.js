const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const EventController = require('../controllers/EventController');
const checkToken = require('../helpers/check-token');

const eventLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 5, 
  message: 'Muitas requisições para eventos, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(eventLimiter);

router.post('/', checkToken, EventController.create);
router.get('/', checkToken, EventController.getUserEvents);
router.get('/stats', checkToken, EventController.getStats);
router.get('/:id', checkToken, EventController.getById);
router.put('/:id', checkToken, EventController.update);
router.put('/:id/cancel', checkToken, EventController.cancel);

module.exports = router;