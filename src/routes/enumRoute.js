const express = require("express");
const router = express.Router();
const enumController = require("../controllers/enumController");

//=========================================Specialization CRUD========================================================//

router.post("/specialization", enumController.postSpecializationEnums);
router.get("/specialization", enumController.getSpecializationEnum);
router.put("/specialization/:id", enumController.updateSpecializationEnum);
router.delete("/specialization/:id", enumController.deleteSpecializationEnum);

//=========================================Qualification CRUD========================================================//

router.post("/qualification", enumController.postQualificationEnums);
router.get("/qualification", enumController.getQualificationEnum);
router.put("/qualification/:id", enumController.updateQualificationEnum);
router.delete("/qualification/:id", enumController.deleteQualificationEnum);

//=========================================Skill CRUD========================================================//

router.post("/skill", enumController.postSkillEnums);
router.get("/skill", enumController.getSkillEnums);
router.put("/skill/:id", enumController.updateSkillEnum);
router.delete("/skill/:id", enumController.deleteSkillEnum);

module.exports = router;
