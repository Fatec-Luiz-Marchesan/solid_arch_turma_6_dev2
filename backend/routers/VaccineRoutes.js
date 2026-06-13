// routers/VaccineRoutes.js

const router = require("express").Router();

const VaccineController =
require("../controllers/VaccineController");

router.post("/", VaccineController.create);

router.get("/", VaccineController.getAll);

router.put("/:id", VaccineController.update);

router.delete("/:id", VaccineController.delete);

module.exports = router;