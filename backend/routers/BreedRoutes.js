const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const verifyToken = require("../helpers/verifyToken");
const BreedController = require("../controllers/BreedController");

const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Muitas criacoes. Tente novamente em 15 minutos" }
});

const updateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Muitas atualizacoes. Tente novamente em 15 minutos" }
});

const deleteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Muitas remocoes. Tente novamente em 15 minutos" }
});

router.post("/", createLimiter, verifyToken, BreedController.create);
router.get("/", BreedController.getAll);
router.get("/:id", BreedController.getById);
router.patch("/:id", updateLimiter, verifyToken, BreedController.update);
router.delete("/:id", deleteLimiter, verifyToken, BreedController.delete);

module.exports = router;
