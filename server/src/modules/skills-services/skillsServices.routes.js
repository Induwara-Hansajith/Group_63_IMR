const express = require("express");
const router = express.Router();

const requireAuth = require("../../middlleware/requireAuth");
const skillsServicesController = require("./skillsServices.controller");

router.get("/skills",skillsServicesController.getSkills)
router.get("/services",skillsServicesController.getServices);

router.get("/my/skills",requireAuth,skillsServicesController.getMySkills);
router.post("/my/skills",requireAuth,skillsServicesController.addMySkill);
router.put("/my/skills/:skillId",requireAuth,skillsServicesController.updateMySkill);
router.delete("/my/skills/:skillId",requireAuth,skillsServicesController.deleteMySkill);

router.get("/my/services",requireAuth,skillsServicesController.getMyServices);
router.post("/my/services",requireAuth,skillsServicesController.addMyService);
router.put("/my/services/:serviceId",requireAuth,skillsServicesController.updateMyService);
router.delete("/my/services/:serviceId",requireAuth,skillsServicesController.deleteMyService);

router.get("/freelancewrs",skillsServicesController.searchFreeLancers);
module.exports = router;

