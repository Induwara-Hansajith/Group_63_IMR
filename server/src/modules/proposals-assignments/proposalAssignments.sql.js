const SQL  =  {
     
    GET_FREELANCER_PROFILE: `
        SELECT UserID, DisplayName, AvailabilityStatus
        FROM dbo.FreelancerProfiles
        WHERE UserID = @FreelancerID;  
    `,

    GET_PROJECT_BY_ID: `
        SELECT ProjectID, ClientID, Title, BudgetType, BudgetMin, BudgetMax, CurrencyCode, Deadline, Status
        FROM dbo.Projects
        WHERE ProjectID = @ProjectID;
    `,

    CHECK_EXISTING_PROPOSAL: `
        SELECT ProposalID, Status
        FROM dbo.Proposals
        WHERE ProjectID = @ProjectID AND FreelancerID   =  @FreelancerID;
    `,

    INSERT_PROPOSAL: `
        INSERT INTO dbo.Proposals (
            ProjectID,
            FreelancerID,
            CoverLetter,
            ProposedAmount,
            CurrencyCode,
            EstimatedDays,
            Status
        )
        OUTPUT  INSERTED.*
        VALUES (
            @ProjectID,
            @FreelancerID,
            @CoverLetter,
            @ProposedAmount,
            @CurrencyCode,
            @EstimatedDays,
            N'pending'
        );
    `,

    
    GET_PROPOSALS_BY_FREELANCER: `
        SELECT
            pr.ProposalID,
            pr.ProjectID,
            p.Title AS ProjectTitle,
            p.Status AS ProjectStatus,
            p.Deadline AS ProjectDeadline,
            cp.OrganizationName AS ClientOrganization,
            cp.ContactName AS ClientContactName,
            pr.CoverLetter,
            pr.ProposedAmount,
            pr.CurrencyCode,
            pr.EstimatedDays,  
            pr.Status AS ProposalStatus,
            pr.SubmittedAt
        FROM dbo.Proposals AS pr
        INNER JOIN dbo.Projects AS p ON p.ProjectID = pr.ProjectID  
        INNER JOIN dbo.ClientProfiles AS cp ON cp.UserID = p.ClientID
        WHERE pr.FreelancerID = @FreelancerID
        ORDER BY pr.SubmittedAt DESC;
    `,

    GET_PROPOSALS_BY_PROJECT: `
        SELECT
            pr.ProposalID,
            pr.ProjectID,
            pr.FreelancerID,
            fp.DisplayName AS FreelancerName,
            fp.ExperienceYears,
            fp.HourlyRate,
            fp.AvailabilityStatus,
            fp.PortfolioURL,
            dbo.fn_UserAverageRating(pr.FreelancerID) AS FreelancerAverageRating,
            pr.CoverLetter,
            pr.ProposedAmount,
            pr.CurrencyCode,
            pr.EstimatedDays,
            pr.Status AS ProposalStatus,
            pr.SubmittedAt
        FROM dbo.Proposals AS pr
        INNER JOIN dbo.FreelancerProfiles AS fp ON fp.UserID =  pr.FreelancerID
        WHERE pr.ProjectID = @ProjectID  
        ORDER BY pr.SubmittedAt ASC;
    `,