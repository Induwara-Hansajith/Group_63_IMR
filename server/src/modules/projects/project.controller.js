const { sql, poolPromise } = require("../../config/db");

const getAllProjects = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT *
            FROM Projects
            ORDER BY ProjectID DESC
        `);

        return res.status(200).json(result.recordset);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
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

        return res.status(200).json(result.recordset[0]);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
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

        return res.status(201).json({
            message: "Project created successfully",
            data: {
                ClientID,
                Title,
                Description,
                BudgetType,
                BudgetMin,
                BudgetMax,
                CurrencyCode,
                Deadline,
                Status
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to create project"
        });
    }
};

const updateProject = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            Title,
            Description,
            BudgetType,
            BudgetMin,
            BudgetMax,
            CurrencyCode,
            Deadline,
            Status
        } = req.body;

        return res.status(200).json({
            message: "Project updated successfully",
            projectId: id,
            data: {
                Title,
                Description,
                BudgetType,
                BudgetMin,
                BudgetMax,
                CurrencyCode,
                Deadline,
                Status
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to update project"
        });
    }
};

const updateProjectStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        return res.status(200).json({
            message: "Project status updated successfully",
            projectId: id,
            status
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to update project status"
        });
    }
};

module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    updateProjectStatus
};
