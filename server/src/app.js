require("dotenv").config();

const express = require("express");
const cors = require("express");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN || "htpp://localhost:5173",
    })
);
app.use(express.json({limit: "1mb"}));

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
    console.log('API listening on http://localhost:${port}');
});