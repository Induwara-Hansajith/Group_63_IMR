const SQL = {
    GET_ALL_PROJECTS: `
        SELECT *
        FROM dbo.Projects
        ORDER BY ProjectID DESC;
    `,

    GET_PROJECT_BY_ID: `
        SELECT *
        FROM dbo.Projects
        WHERE ProjectID = @ProjectID;
    `
};

module.exports = SQL;