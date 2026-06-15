const router = require("express").Router();
const verifyToken = require("../helpers/verifyToken");
const BreedController = require("../controllers/BreedController");

router.post("/", verifyToken, BreedController.create);
router.get("/", BreedController.getAll);
router.get("/:id", BreedController.getById);
router.patch("/:id", verifyToken, BreedController.update);
router.delete("/:id", verifyToken, BreedController.delete);

module.exports = router;
