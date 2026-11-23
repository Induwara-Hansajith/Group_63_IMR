const SQL = {
    // 1. Proposal submission and validation
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
        WHERE ProjectID = @ProjectID AND FreelancerID = @FreelancerID;
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
        OUTPUT INSERTED.*
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

    //proposal retrieval 
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
        INNER JOIN dbo.FreelancerProfiles AS fp ON fp.UserID = pr.FreelancerID
        WHERE pr.ProjectID = @ProjectID
        ORDER BY pr.SubmittedAt ASC;
    `,

    //  Single Proposal Lookup and  Status Updates
    GET_PROPOSAL_WITH_PROJECT: `
        SELECT
            pr.ProposalID,
            pr.ProjectID,
            pr.FreelancerID,
            pr.ProposedAmount,
            pr.CurrencyCode,
            pr.EstimatedDays,
            pr.Status AS ProposalStatus,
            p.ClientID,
            p.Title AS ProjectTitle,
            p.Status AS ProjectStatus
        FROM dbo.Proposals AS pr
        INNER JOIN dbo.Projects AS p ON p.ProjectID = pr.ProjectID
        WHERE pr.ProposalID = @ProposalID;
    `,

    UPDATE_PROPOSAL_STATUS: `
        UPDATE dbo.Proposals
        SET Status = @Status
        OUTPUT INSERTED.*
        WHERE ProposalID = @ProposalID;
    `,

     
    ACCEPT_TARGET_PROPOSAL: `
        UPDATE dbo.Proposals
        SET Status = N'accepted'
        WHERE ProposalID = @ProposalID AND Status = N'pending';
    `,

    REJECT_OTHER_PENDING_PROPOSALS: `
        UPDATE dbo.Proposals
        SET Status = N'rejected'
        WHERE ProjectID = @ProjectID
          AND ProposalID <> @ProposalID
          AND Status = N'pending';
    `,

    INSERT_PROJECT_ASSIGNMENT: `
        INSERT INTO dbo.ProjectAssignments (
            ProjectID,
            FreelancerID,
            ProposalID,
            Status
        )
        VALUES (
            @ProjectID,
            @FreelancerID,
            @ProposalID,
            N'assigned'
        );

        SELECT *
        FROM dbo.ProjectAssignments
        WHERE AssignmentID = SCOPE_IDENTITY();
    `,

    SET_PROJECT_IN_PROGRESS: `
        UPDATE dbo.Projects
        SET Status = N'in_progress',
            UpdatedAt = SYSUTCDATETIME()
        WHERE ProjectID = @ProjectID;
    `,

    // 5. Assignments & Progress Tracking
    GET_ASSIGNMENTS_BY_USER: `
        SELECT
            a.AssignmentID,
            a.ProjectID,
            p.Title AS ProjectTitle,
            p.Deadline AS ProjectDeadline,
            p.Status AS ProjectStatus,
            a.FreelancerID,
            fp.DisplayName AS FreelancerName,
            p.ClientID,
            cp.OrganizationName AS ClientOrganization,
            cp.ContactName AS ClientContactName,
            a.ProposalID,
            pr.ProposedAmount AS AgreedAmount,
            pr.CurrencyCode,
            pr.EstimatedDays,
            a.Status AS AssignmentStatus,
            a.AssignedAt,
            a.StartedAt,
            a.CompletedAt
        FROM dbo.ProjectAssignments AS a
        INNER JOIN dbo.Projects AS p ON p.ProjectID = a.ProjectID
        INNER JOIN dbo.Proposals AS pr ON pr.ProposalID = a.ProposalID
        INNER JOIN dbo.FreelancerProfiles AS fp ON fp.UserID = a.FreelancerID
        INNER JOIN dbo.ClientProfiles AS cp ON cp.UserID = p.ClientID
        WHERE (@Role = N'admin')
           OR (@Role = N'freelancer' AND a.FreelancerID = @UserID)
           OR (@Role = N'client' AND p.ClientID = @UserID)
        ORDER BY a.AssignedAt DESC;
    `,

    GET_ASSIGNMENT_BY_ID: `
        SELECT
            a.AssignmentID,
            a.ProjectID,
            p.Title AS ProjectTitle,
            p.Description AS ProjectDescription,
            p.Deadline AS ProjectDeadline,
            p.Status AS ProjectStatus,
            a.FreelancerID,
            fp.DisplayName AS FreelancerName,
            fp.PortfolioURL AS FreelancerPortfolioURL,
            p.ClientID,
            cp.OrganizationName AS ClientOrganization,
            cp.ContactName AS ClientContactName,
            a.ProposalID,
            pr.CoverLetter,
            pr.ProposedAmount AS AgreedAmount,
            pr.CurrencyCode,
            pr.EstimatedDays,
            a.Status AS AssignmentStatus,
            a.AssignedAt,
            a.StartedAt,
            a.CompletedAt
        FROM dbo.ProjectAssignments AS a
        INNER JOIN dbo.Projects AS p ON p.ProjectID = a.ProjectID
        INNER JOIN dbo.Proposals AS pr ON pr.ProposalID = a.ProposalID
        INNER JOIN dbo.FreelancerProfiles AS fp ON fp.UserID = a.FreelancerID
        INNER JOIN dbo.ClientProfiles AS cp ON cp.UserID = p.ClientID
        WHERE a.AssignmentID = @AssignmentID;
    `,

UPDATE_ASSIGNMENT_STATUS: `
        UPDATE dbo.ProjectAssignments
        SET Status = @NewStatus,
            StartedAt = CASE
                WHEN @NewStatus = N'in_progress' AND StartedAt IS NULL THEN SYSUTCDATETIME()
                ELSE StartedAt
            END,
            CompletedAt = CASE
                WHEN @NewStatus = N'completed' THEN SYSUTCDATETIME()
                ELSE CompletedAt
            END
        WHERE AssignmentID = @AssignmentID;

        SELECT *
        FROM dbo.ProjectAssignments
        WHERE AssignmentID = @AssignmentID;
    `,

    SYNC_PROJECT_STATUS_FROM_ASSIGNMENT: `
        UPDATE dbo.Projects
        SET Status = @ProjectStatus,
            UpdatedAt = SYSUTCDATETIME()
        WHERE ProjectID = @ProjectID;
    `,
};

module.exports = SQL;