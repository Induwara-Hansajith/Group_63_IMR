const express = require("express");

const router = express.Router();

const {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    updateProjectStatus
} = require("./project.controller");


router.get("/", getAllProjects);

router.get("/:id", getProjectById);

router.post("/", createProject);

router.put("/:id", updateProject);

router.patch("/:id", updateProjectStatus);

module.exports = router;
