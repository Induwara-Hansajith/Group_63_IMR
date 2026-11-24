const express = require("express");

const router = express.Router();

const {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    updateProjectStatus,
    getProjectSkills,
    addProjectSkill
} = require("./project.controller");


router.get("/", getAllProjects);

router.get("/:id", getProjectById);

router.post("/", createProject);

router.put("/:id", updateProject);

router.patch("/:id", updateProjectStatus);

router.get("/:id/skills", getProjectSkills);

router.post("/:id/skills", addProjectSkill);

module.exports = router;
