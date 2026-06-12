const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', authMiddleware, async (req, res) => {
  const admin = await Admin.findById(req.adminId);
  res.json(admin);
});

module.exports = router;