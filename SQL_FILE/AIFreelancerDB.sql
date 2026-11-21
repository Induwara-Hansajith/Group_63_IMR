IF DB_ID(N'AIFreelancePlatform') IS NULL
    CREATE DATABASE AIFreelancePlatform;
GO

USE AIFreelancePlatform;
GO

CREATE TABLE dbo.Roles (
    RoleID       TINYINT IDENTITY(1,1) PRIMARY KEY,
    RoleName     NVARCHAR(30) NOT NULL UNIQUE
);

INSERT INTO dbo.Roles (RoleName)
VALUES (N'freelancer'), (N'client'), (N'admin'), (N'manager');

CREATE TABLE dbo.Users (
    UserID          BIGINT IDENTITY(1,1) PRIMARY KEY,
    RoleID          TINYINT NOT NULL,
    Email           NVARCHAR(320) NOT NULL UNIQUE,
    PasswordHash    NVARCHAR(255) NOT NULL,
    AccountStatus   NVARCHAR(20) NOT NULL DEFAULT N'active',
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Users_Roles
        FOREIGN KEY (RoleID) REFERENCES dbo.Roles(RoleID),
    CONSTRAINT CK_Users_AccountStatus
        CHECK (AccountStatus IN (N'active', N'suspended', N'closed'))
);

CREATE TABLE dbo.FreelancerProfiles (
    UserID              BIGINT PRIMARY KEY,
    DisplayName         NVARCHAR(120) NOT NULL,
    Biography           NVARCHAR(MAX) NULL,
    ExperienceYears     DECIMAL(4,1) NULL,
    HourlyRate          DECIMAL(12,2) NULL,
    CurrencyCode        CHAR(3) NOT NULL DEFAULT 'USD',
    AvailabilityStatus  NVARCHAR(20) NOT NULL DEFAULT N'available',
    PortfolioURL        NVARCHAR(500) NULL,
    UpdatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_FreelancerProfiles_Users
        FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_FreelancerProfiles_Experience
        CHECK (ExperienceYears IS NULL OR ExperienceYears >= 0),
    CONSTRAINT CK_FreelancerProfiles_HourlyRate
        CHECK (HourlyRate IS NULL OR HourlyRate >= 0),
    CONSTRAINT CK_FreelancerProfiles_Availability
        CHECK (AvailabilityStatus IN (N'available', N'busy', N'unavailable'))
);

CREATE TABLE dbo.ClientProfiles (
    UserID              BIGINT PRIMARY KEY,
    OrganizationName    NVARCHAR(200) NULL,
    ContactName         NVARCHAR(120) NOT NULL,
    Phone               NVARCHAR(40) NULL,
    WebsiteURL          NVARCHAR(500) NULL,
    BillingAddress      NVARCHAR(500) NULL,
    UpdatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ClientProfiles_Users
        FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.SkillCategories (
    SkillCategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName    NVARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE dbo.AISkills (
    SkillID          INT IDENTITY(1,1) PRIMARY KEY,
    SkillCategoryID  INT NOT NULL,
    SkillName        NVARCHAR(120) NOT NULL,
    Description      NVARCHAR(500) NULL,
    CONSTRAINT FK_AISkills_SkillCategories
        FOREIGN KEY (SkillCategoryID)
        REFERENCES dbo.SkillCategories(SkillCategoryID),
    CONSTRAINT UQ_AISkills_Category_Name
        UNIQUE (SkillCategoryID, SkillName)
);

CREATE TABLE dbo.ServiceCategories (
    ServiceCategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName      NVARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE dbo.AIServices (
    ServiceID          INT IDENTITY(1,1) PRIMARY KEY,
    ServiceCategoryID  INT NOT NULL,
    ServiceName        NVARCHAR(150) NOT NULL,
    Description        NVARCHAR(1000) NULL,
    CONSTRAINT FK_AIServices_ServiceCategories
        FOREIGN KEY (ServiceCategoryID)
        REFERENCES dbo.ServiceCategories(ServiceCategoryID),
    CONSTRAINT UQ_AIServices_Category_Name
        UNIQUE (ServiceCategoryID, ServiceName)
);

CREATE TABLE dbo.FreelancerSkills (
    FreelancerID       BIGINT NOT NULL,
    SkillID            INT NOT NULL,
    ProficiencyLevel   NVARCHAR(20) NOT NULL,
    YearsExperience    DECIMAL(4,1) NULL,
    PRIMARY KEY (FreelancerID, SkillID),
    CONSTRAINT FK_FreelancerSkills_Profile
        FOREIGN KEY (FreelancerID)
        REFERENCES dbo.FreelancerProfiles(UserID),
    CONSTRAINT FK_FreelancerSkills_Skill
        FOREIGN KEY (SkillID) REFERENCES dbo.AISkills(SkillID),
    CONSTRAINT CK_FreelancerSkills_Proficiency
        CHECK (ProficiencyLevel IN
            (N'beginner', N'intermediate', N'advanced', N'expert')),
    CONSTRAINT CK_FreelancerSkills_Experience
        CHECK (YearsExperience IS NULL OR YearsExperience >= 0)
);

CREATE TABLE dbo.FreelancerServices (
    FreelancerID   BIGINT NOT NULL,
    ServiceID      INT NOT NULL,
    StartingPrice  DECIMAL(12,2) NULL,
    CurrencyCode   CHAR(3) NOT NULL DEFAULT 'USD',
    PRIMARY KEY (FreelancerID, ServiceID),
    CONSTRAINT FK_FreelancerServices_Profile
        FOREIGN KEY (FreelancerID)
        REFERENCES dbo.FreelancerProfiles(UserID),
    CONSTRAINT FK_FreelancerServices_Service
        FOREIGN KEY (ServiceID) REFERENCES dbo.AIServices(ServiceID),
    CONSTRAINT CK_FreelancerServices_Price
        CHECK (StartingPrice IS NULL OR StartingPrice >= 0)
);

CREATE TABLE dbo.Projects (
    ProjectID       BIGINT IDENTITY(1,1) PRIMARY KEY,
    ClientID        BIGINT NOT NULL,
    Title           NVARCHAR(200) NOT NULL,
    Description     NVARCHAR(MAX) NOT NULL,
    BudgetType      NVARCHAR(20) NOT NULL DEFAULT N'fixed',
    BudgetMin       DECIMAL(12,2) NULL,
    BudgetMax       DECIMAL(12,2) NULL,
    CurrencyCode    CHAR(3) NOT NULL DEFAULT 'USD',
    Deadline        DATE NULL,
    Status          NVARCHAR(20) NOT NULL DEFAULT N'draft',
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Projects_Clients
        FOREIGN KEY (ClientID) REFERENCES dbo.ClientProfiles(UserID),
    CONSTRAINT CK_Projects_BudgetType
        CHECK (BudgetType IN (N'fixed', N'hourly')),
    CONSTRAINT CK_Projects_BudgetMin
        CHECK (BudgetMin IS NULL OR BudgetMin >= 0),
    CONSTRAINT CK_Projects_BudgetMax
        CHECK (BudgetMax IS NULL OR BudgetMax >= 0),
    CONSTRAINT CK_Projects_BudgetRange
        CHECK (BudgetMin IS NULL OR BudgetMax IS NULL OR BudgetMax >= BudgetMin),
    CONSTRAINT CK_Projects_Status
        CHECK (Status IN
            (N'draft', N'open', N'in_progress', N'completed', N'cancelled', N'closed'))
);

CREATE TABLE dbo.ProjectRequirements (
    RequirementID    BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProjectID        BIGINT NOT NULL,
    RequirementType  NVARCHAR(20) NOT NULL DEFAULT N'other',
    RequirementText  NVARCHAR(2000) NOT NULL,
    IsMandatory      BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_ProjectRequirements_Projects
        FOREIGN KEY (ProjectID) REFERENCES dbo.Projects(ProjectID),
    CONSTRAINT CK_ProjectRequirements_Type
        CHECK (RequirementType IN
            (N'functional', N'technical', N'deliverable', N'constraint', N'other'))
);

CREATE TABLE dbo.ProjectRequiredSkills (
    ProjectID BIGINT NOT NULL,
    SkillID   INT NOT NULL,
    PRIMARY KEY (ProjectID, SkillID),
    FOREIGN KEY (ProjectID) REFERENCES dbo.Projects(ProjectID),
    FOREIGN KEY (SkillID) REFERENCES dbo.AISkills(SkillID)
);

CREATE TABLE dbo.ProjectRequiredServices (
    ProjectID BIGINT NOT NULL,
    ServiceID INT NOT NULL,
    PRIMARY KEY (ProjectID, ServiceID),
    FOREIGN KEY (ProjectID) REFERENCES dbo.Projects(ProjectID),
    FOREIGN KEY (ServiceID) REFERENCES dbo.AIServices(ServiceID)
);

CREATE TABLE dbo.Proposals (
    ProposalID       BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProjectID        BIGINT NOT NULL,
    FreelancerID     BIGINT NOT NULL,
    CoverLetter      NVARCHAR(MAX) NOT NULL,
    ProposedAmount   DECIMAL(12,2) NOT NULL,
    CurrencyCode     CHAR(3) NOT NULL DEFAULT 'USD',
    EstimatedDays    INT NULL,
    Status           NVARCHAR(20) NOT NULL DEFAULT N'pending',
    SubmittedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Proposals_Projects
        FOREIGN KEY (ProjectID) REFERENCES dbo.Projects(ProjectID),
    CONSTRAINT FK_Proposals_Freelancers
        FOREIGN KEY (FreelancerID)
        REFERENCES dbo.FreelancerProfiles(UserID),
    CONSTRAINT UQ_Proposals_Project_Freelancer
        UNIQUE (ProjectID, FreelancerID),
    CONSTRAINT UQ_Proposals_Triple
        UNIQUE (ProposalID, ProjectID, FreelancerID),
    CONSTRAINT CK_Proposals_Amount CHECK (ProposedAmount >= 0),
    CONSTRAINT CK_Proposals_EstimatedDays
        CHECK (EstimatedDays IS NULL OR EstimatedDays > 0),
    CONSTRAINT CK_Proposals_Status
        CHECK (Status IN (N'pending', N'accepted', N'rejected', N'withdrawn'))
);

CREATE TABLE dbo.ProjectAssignments (
    AssignmentID    BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProjectID       BIGINT NOT NULL UNIQUE,
    FreelancerID    BIGINT NOT NULL,
    ProposalID      BIGINT NOT NULL UNIQUE,
    AssignedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    StartedAt       DATETIME2 NULL,
    CompletedAt     DATETIME2 NULL,
    Status          NVARCHAR(20) NOT NULL DEFAULT N'assigned',
    CONSTRAINT FK_ProjectAssignments_Proposal
        FOREIGN KEY (ProposalID, ProjectID, FreelancerID)
        REFERENCES dbo.Proposals(ProposalID, ProjectID, FreelancerID),
    CONSTRAINT CK_ProjectAssignments_Status
        CHECK (Status IN
            (N'assigned', N'in_progress', N'submitted', N'completed', N'cancelled'))
);

CREATE TABLE dbo.Payments (
    PaymentID       BIGINT IDENTITY(1,1) PRIMARY KEY,
    AssignmentID    BIGINT NOT NULL,
    Amount          DECIMAL(12,2) NOT NULL,
    CurrencyCode    CHAR(3) NOT NULL DEFAULT 'USD',
    PaymentStatus   NVARCHAR(20) NOT NULL DEFAULT N'pending',
    PaymentMethod   NVARCHAR(40) NULL,
    TransactionRef  NVARCHAR(200) NULL,
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PaidAt          DATETIME2 NULL,
    CONSTRAINT FK_Payments_Assignments
        FOREIGN KEY (AssignmentID)
        REFERENCES dbo.ProjectAssignments(AssignmentID),
    CONSTRAINT CK_Payments_Amount CHECK (Amount > 0),
    CONSTRAINT CK_Payments_Status
        CHECK (PaymentStatus IN (N'pending', N'paid', N'failed', N'refunded'))
);

CREATE UNIQUE INDEX UX_Payments_TransactionRef
    ON dbo.Payments(TransactionRef)
    WHERE TransactionRef IS NOT NULL;

CREATE TABLE dbo.Reviews (
    ReviewID       BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProjectID      BIGINT NOT NULL,
    ReviewerID     BIGINT NOT NULL,
    RevieweeID     BIGINT NOT NULL,
    Rating         TINYINT NOT NULL,
    Comment        NVARCHAR(2000) NULL,
    CreatedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Reviews_Projects
        FOREIGN KEY (ProjectID) REFERENCES dbo.Projects(ProjectID),
    CONSTRAINT FK_Reviews_Reviewer
        FOREIGN KEY (ReviewerID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_Reviews_Reviewee
        FOREIGN KEY (RevieweeID) REFERENCES dbo.Users(UserID),
    CONSTRAINT UQ_Reviews_Project_Pair
        UNIQUE (ProjectID, ReviewerID, RevieweeID),
    CONSTRAINT CK_Reviews_Rating CHECK (Rating BETWEEN 1 AND 5),
    CONSTRAINT CK_Reviews_DifferentUsers CHECK (ReviewerID <> RevieweeID)
);

CREATE TABLE dbo.Disputes (
    DisputeID       BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProjectID       BIGINT NOT NULL,
    RaisedByUserID  BIGINT NOT NULL,
    Subject         NVARCHAR(200) NOT NULL,
    Description     NVARCHAR(MAX) NOT NULL,
    Status          NVARCHAR(20) NOT NULL DEFAULT N'open',
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ResolvedAt      DATETIME2 NULL,
    CONSTRAINT FK_Disputes_Projects
        FOREIGN KEY (ProjectID) REFERENCES dbo.Projects(ProjectID),
    CONSTRAINT FK_Disputes_Users
        FOREIGN KEY (RaisedByUserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT CK_Disputes_Status
        CHECK (Status IN (N'open', N'investigating', N'resolved', N'closed'))
);
GO

CREATE OR ALTER TRIGGER dbo.TR_ProjectAssignments_RequireAcceptedProposal
ON dbo.ProjectAssignments
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted AS i
        INNER JOIN dbo.Proposals AS p ON p.ProposalID = i.ProposalID
        WHERE p.Status <> N'accepted'
    )
    BEGIN
        THROW 51001, 'An assignment must use an accepted proposal.', 1;
    END;
END;
GO

CREATE OR ALTER FUNCTION dbo.fn_UserAverageRating (@UserID BIGINT)
RETURNS DECIMAL(3,2)
AS
BEGIN
    DECLARE @AverageRating DECIMAL(3,2);

    SELECT @AverageRating =
        CAST(AVG(CAST(Rating AS DECIMAL(4,2))) AS DECIMAL(3,2))
    FROM dbo.Reviews
    WHERE RevieweeID = @UserID;

    RETURN @AverageRating;
END;
GO

CREATE OR ALTER VIEW dbo.vw_ProjectPaymentSummary
AS
SELECT
    p.ProjectID,
    p.Title,
    p.Status AS ProjectStatus,
    cp.OrganizationName,
    COUNT(DISTINCT a.AssignmentID) AS AssignmentCount,
    COALESCE(SUM(CASE WHEN pay.PaymentStatus = N'paid' THEN pay.Amount ELSE 0 END), 0)
        AS TotalPaid,
    COALESCE(SUM(CASE WHEN pay.PaymentStatus = N'pending' THEN pay.Amount ELSE 0 END), 0)
        AS TotalPending
FROM dbo.Projects AS p
INNER JOIN dbo.ClientProfiles AS cp ON cp.UserID = p.ClientID
LEFT JOIN dbo.ProjectAssignments AS a ON a.ProjectID = p.ProjectID
LEFT JOIN dbo.Payments AS pay ON pay.AssignmentID = a.AssignmentID
GROUP BY p.ProjectID, p.Title, p.Status, cp.OrganizationName;
GO