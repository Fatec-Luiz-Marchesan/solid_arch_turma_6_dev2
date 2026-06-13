const router = require("express").Router();

const BreedController = require("../controllers/BreedController");

router.post("/", BreedController.create);

router.get("/", BreedController.getAll);

router.get("/:id", BreedController.getById);

router.patch("/:id", BreedController.update);

router.delete("/:id", BreedController.delete);

module.exports = router;