const express = require("express");

const router = express.Router();

const {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    updateProjectStatus,
    getProjectSkills,
    addProjectSkill,
    searchProjects
} = require("./project.controller");


router.get("/", getAllProjects);

router.get("/search", searchProjects);

router.get("/:id", getProjectById);

router.post("/", createProject);

router.put("/:id", updateProject);

router.patch("/:id/status", updateProjectStatus);

router.get("/:id/skills", getProjectSkills);

router.post("/:id/skills", addProjectSkill);

module.exports = router;
