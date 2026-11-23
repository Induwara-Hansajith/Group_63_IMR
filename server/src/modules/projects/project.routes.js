const express = require("express");

const router = express.Router();

const {
    getAllProjects,
    getProjectById,
    createProject
} = require("./project.controller");


router.get("/", getAllProjects);

router.get("/:id", getProjectById);

module.exports = router;