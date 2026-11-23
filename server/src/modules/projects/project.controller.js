const { sql, poolPromise } = require("../../config/db");

const getAllProjects = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT *
            FROM Projects
            ORDER BY ProjectID DESC
        `);

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve projects"
        });
    }
};

const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await poolPromise;

        const result = await pool
            .request()
            .input("id", sql.BigInt, id)
            .query(`
                SELECT *
                FROM Projects
                WHERE ProjectID = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.status(200).json(result.recordset[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve project"
        });
    }
};
const createProject = async (req, res) => {
    try {
        const {
            ClientID,
            Title,
            Description,
            BudgetType,
            BudgetMin,
            BudgetMax,
            CurrencyCode,
            Deadline,
            Status
        } = req.body;

        res.status(201).json({
            message: "Project created successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create project"
        });
    }
};

module.exports = {
    getAllProjects,
    getProjectById,
    createProject
};