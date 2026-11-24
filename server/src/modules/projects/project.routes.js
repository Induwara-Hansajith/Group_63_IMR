const express = require("express");

const router = express.Router();

const {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject
} = require("./project.controller");


router.get("/", getAllProjects);

router.get("/:id", getProjectById);

router.post("/", createProject);

router.put("/:id", updateProject);

module.exports = router;
