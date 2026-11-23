require("dotenv").config();

const express = require("express");
const cors = require("cors");
const projectRoutes = require("./modules/projects/project.routes");
const authRoutes = require("./routes/auth.routes");
const proposalAssignmentRoutes = require("./modules/proposals-assignments/proposalAssignments.routes");

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    })
);
app.use(express.json({limit: "1mb"}));

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api", proposalAssignmentRoutes);
app.use("/api/projects", projectRoutes);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
});
