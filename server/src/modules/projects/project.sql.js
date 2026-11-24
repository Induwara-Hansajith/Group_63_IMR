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
    `,

    CREATE_PROJECT: `
        INSERT INTO dbo.Projects (
            ClientID,
            Title,
            Description,
            BudgetType,
            BudgetMin,
            BudgetMax,
            CurrencyCode,
            Deadline,
            Status
        )
        VALUES (
            @ClientID,
            @Title,
            @Description,
            @BudgetType,
            @BudgetMin,
            @BudgetMax,
            @CurrencyCode,
            @Deadline,
            @Status
        );
    `
};

module.exports = SQL;