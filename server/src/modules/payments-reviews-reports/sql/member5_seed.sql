USE AIFreelancePlatform;
GO

BEGIN TRANSACTION;

DECLARE @RoleFreelancer TINYINT = (SELECT RoleID FROM dbo.Roles WHERE RoleName = N'freelancer');
DECLARE @RoleClient     TINYINT = (SELECT RoleID FROM dbo.Roles WHERE RoleName = N'client');
DECLARE @RoleAdmin      TINYINT = (SELECT RoleID FROM dbo.Roles WHERE RoleName = N'admin');
DECLARE @RoleManager    TINYINT = (SELECT RoleID FROM dbo.Roles WHERE RoleName = N'manager');

INSERT INTO dbo.Users (RoleID, Email, PasswordHash, AccountStatus)
VALUES
  (@RoleAdmin,      N'admin@aiplatform.demo',      N'$2a$10$demoPlaceholderHashAdmin000000000000000000000000000000', N'active'),
  (@RoleManager,    N'manager@aiplatform.demo',    N'$2a$10$demoPlaceholderHashManager0000000000000000000000000000', N'active'),
  (@RoleClient,     N'client1@nexa.demo',          N'$2a$10$demoPlaceholderHashClient10000000000000000000000000000', N'active'),
  (@RoleClient,     N'client2@finvision.demo',     N'$2a$10$demoPlaceholderHashClient20000000000000000000000000000', N'active'),
  (@RoleFreelancer, N'alice.ml@freelance.demo',    N'$2a$10$demoPlaceholderHashFree1000000000000000000000000000000', N'active'),
  (@RoleFreelancer, N'ben.nlp@freelance.demo',     N'$2a$10$demoPlaceholderHashFree2000000000000000000000000000000', N'active'),
  (@RoleFreelancer, N'chloe.cv@freelance.demo',    N'$2a$10$demoPlaceholderHashFree3000000000000000000000000000000', N'suspended');

DECLARE @Client1 BIGINT = (SELECT UserID FROM dbo.Users WHERE Email = N'client1@nexa.demo');
DECLARE @Client2 BIGINT = (SELECT UserID FROM dbo.Users WHERE Email = N'client2@finvision.demo');
DECLARE @Free1   BIGINT = (SELECT UserID FROM dbo.Users WHERE Email = N'alice.ml@freelance.demo');
DECLARE @Free2   BIGINT = (SELECT UserID FROM dbo.Users WHERE Email = N'ben.nlp@freelance.demo');
DECLARE @Free3   BIGINT = (SELECT UserID FROM dbo.Users WHERE Email = N'chloe.cv@freelance.demo');

INSERT INTO dbo.ClientProfiles (UserID, OrganizationName, ContactName, Phone)
VALUES
  (@Client1, N'Nexa Health AI',    N'Nadeesha Perera', N'+94 77 100 2001'),
  (@Client2, N'FinVision Systems', N'Kavindu Silva',   N'+94 77 100 2002');

INSERT INTO dbo.FreelancerProfiles (UserID, DisplayName, Biography, ExperienceYears, HourlyRate, AvailabilityStatus)
VALUES
  (@Free1, N'Alice Fernando', N'Machine Learning & Forecasting Engineer', 4.5, 65.00, N'available'),
  (@Free2, N'Ben Jayasuriya', N'NLP & Generative AI Specialist',          3.0, 55.00, N'busy'),
  (@Free3, N'Chloe De Silva', N'Computer Vision & OCR Developer',         2.5, 50.00, N'unavailable');

INSERT INTO dbo.SkillCategories (CategoryName)
VALUES (N'Machine Learning'), (N'Natural Language Processing'), (N'Computer Vision'), (N'Generative AI');

DECLARE @CatML  INT = (SELECT SkillCategoryID FROM dbo.SkillCategories WHERE CategoryName = N'Machine Learning');
DECLARE @CatNLP INT = (SELECT SkillCategoryID FROM dbo.SkillCategories WHERE CategoryName = N'Natural Language Processing');
DECLARE @CatCV  INT = (SELECT SkillCategoryID FROM dbo.SkillCategories WHERE CategoryName = N'Computer Vision');
DECLARE @CatGen INT = (SELECT SkillCategoryID FROM dbo.SkillCategories WHERE CategoryName = N'Generative AI');

INSERT INTO dbo.AISkills (SkillCategoryID, SkillName, Description)
VALUES
  (@CatML,  N'PyTorch',           N'Deep learning model training'),
  (@CatNLP, N'RAG Pipelines',     N'Retrieval-augmented generation'),
  (@CatCV,  N'YOLOv8 Detection',  N'Real-time object detection'),
  (@CatGen, N'LLM Fine-Tuning',   N'Custom domain LLM adaptation');

DECLARE @SkillPyTorch INT = (SELECT SkillID FROM dbo.AISkills WHERE SkillName = N'PyTorch');
DECLARE @SkillRAG     INT = (SELECT SkillID FROM dbo.AISkills WHERE SkillName = N'RAG Pipelines');
DECLARE @SkillYOLO    INT = (SELECT SkillID FROM dbo.AISkills WHERE SkillName = N'YOLOv8 Detection');
DECLARE @SkillLLM     INT = (SELECT SkillID FROM dbo.AISkills WHERE SkillName = N'LLM Fine-Tuning');

INSERT INTO dbo.ServiceCategories (CategoryName)
VALUES (N'Model Development'), (N'AI Chatbots & Agents'), (N'Data Analytics');

DECLARE @SvcCatModel INT = (SELECT ServiceCategoryID FROM dbo.ServiceCategories WHERE CategoryName = N'Model Development');
DECLARE @SvcCatBot   INT = (SELECT ServiceCategoryID FROM dbo.ServiceCategories WHERE CategoryName = N'AI Chatbots & Agents');
DECLARE @SvcCatData  INT = (SELECT ServiceCategoryID FROM dbo.ServiceCategories WHERE CategoryName = N'Data Analytics');

INSERT INTO dbo.AIServices (ServiceCategoryID, ServiceName, Description)
VALUES
  (@SvcCatModel, N'Custom Predictive Model', N'End-to-end ML model training and deployment'),
  (@SvcCatBot,   N'Enterprise RAG Chatbot',  N'Document-aware customer support assistant'),
  (@SvcCatData,  N'BI Forecasting Pipeline', N'Automated revenue and demand forecasting');

DECLARE @SvcModel INT = (SELECT ServiceID FROM dbo.AIServices WHERE ServiceName = N'Custom Predictive Model');
DECLARE @SvcBot   INT = (SELECT ServiceID FROM dbo.AIServices WHERE ServiceName = N'Enterprise RAG Chatbot');
DECLARE @SvcData  INT = (SELECT ServiceID FROM dbo.AIServices WHERE ServiceName = N'BI Forecasting Pipeline');

INSERT INTO dbo.Projects (ClientID, Title, Description, BudgetType, BudgetMin, BudgetMax, Status, CreatedAt)
VALUES
  (@Client1, N'Medical Triage RAG Assistant',   N'Build a grounded clinical Q&A chatbot.',     N'fixed', 1800, 2500, N'completed',   '2026-08-10'),
  (@Client2, N'Invoice Fraud Anomaly Detector', N'Detect anomalous transactions in real time.', N'fixed', 2500, 3500, N'completed',   '2026-09-05'),
  (@Client1, N'X-Ray Quality Inspection CV',    N'Automated defect detection pipeline.',        N'fixed', 2000, 3000, N'in_progress', '2026-10-12'),
  (@Client2, N'Quarterly Revenue Forecaster',   N'Time-series forecasting dashboard.',          N'fixed', 1200, 1800, N'open',        '2026-11-02');

DECLARE @Proj1 BIGINT = (SELECT ProjectID FROM dbo.Projects WHERE Title = N'Medical Triage RAG Assistant');
DECLARE @Proj2 BIGINT = (SELECT ProjectID FROM dbo.Projects WHERE Title = N'Invoice Fraud Anomaly Detector');
DECLARE @Proj3 BIGINT = (SELECT ProjectID FROM dbo.Projects WHERE Title = N'X-Ray Quality Inspection CV');
DECLARE @Proj4 BIGINT = (SELECT ProjectID FROM dbo.Projects WHERE Title = N'Quarterly Revenue Forecaster');

INSERT INTO dbo.ProjectRequiredSkills (ProjectID, SkillID)
VALUES
  (@Proj1, @SkillRAG), (@Proj1, @SkillLLM),
  (@Proj2, @SkillPyTorch),
  (@Proj3, @SkillYOLO), (@Proj3, @SkillPyTorch),
  (@Proj4, @SkillPyTorch);

INSERT INTO dbo.ProjectRequiredServices (ProjectID, ServiceID)
VALUES
  (@Proj1, @SvcBot),
  (@Proj2, @SvcModel),
  (@Proj3, @SvcModel),
  (@Proj4, @SvcData);

INSERT INTO dbo.Proposals (ProjectID, FreelancerID, CoverLetter, ProposedAmount, EstimatedDays, Status, SubmittedAt)
VALUES
  (@Proj1, @Free2, N'Experienced in healthcare RAG chatbots.',   2200.00, 20, N'accepted', '2026-08-12'),
  (@Proj1, @Free1, N'Can deliver with PyTorch + vector search.', 2400.00, 25, N'rejected', '2026-08-12'),
  (@Proj2, @Free1, N'Built fraud models for banking clients.',   3000.00, 30, N'accepted', '2026-09-07'),
  (@Proj3, @Free1, N'Ready to implement YOLOv8 inspection.',     2600.00, 28, N'accepted', '2026-10-14'),
  (@Proj4, @Free2, N'Can build forecasting with Prophet/ML.',    1500.00, 14, N'pending',  '2026-11-04');

DECLARE @Prop1 BIGINT = (SELECT ProposalID FROM dbo.Proposals WHERE ProjectID = @Proj1 AND FreelancerID = @Free2);
DECLARE @Prop2 BIGINT = (SELECT ProposalID FROM dbo.Proposals WHERE ProjectID = @Proj2 AND FreelancerID = @Free1);
DECLARE @Prop3 BIGINT = (SELECT ProposalID FROM dbo.Proposals WHERE ProjectID = @Proj3 AND FreelancerID = @Free1);

INSERT INTO dbo.ProjectAssignments (ProjectID, FreelancerID, ProposalID, AssignedAt, StartedAt, CompletedAt, Status)
VALUES
  (@Proj1, @Free2, @Prop1, '2026-08-14', '2026-08-15', '2026-09-03', N'completed'),
  (@Proj2, @Free1, @Prop2, '2026-09-09', '2026-09-10', '2026-10-08', N'completed'),
  (@Proj3, @Free1, @Prop3, '2026-10-16', '2026-10-17', NULL,         N'in_progress');

DECLARE @Assign1 BIGINT = (SELECT AssignmentID FROM dbo.ProjectAssignments WHERE ProjectID = @Proj1);
DECLARE @Assign2 BIGINT = (SELECT AssignmentID FROM dbo.ProjectAssignments WHERE ProjectID = @Proj2);
DECLARE @Assign3 BIGINT = (SELECT AssignmentID FROM dbo.ProjectAssignments WHERE ProjectID = @Proj3);

INSERT INTO dbo.Payments (AssignmentID, Amount, CurrencyCode, PaymentStatus, PaymentMethod, TransactionRef, CreatedAt, PaidAt)
VALUES
  (@Assign1, 2200.00, 'USD', N'paid',     N'card',          N'TXN-202609-001', '2026-09-04', '2026-09-04'),
  (@Assign2, 1500.00, 'USD', N'paid',     N'bank_transfer', N'TXN-202609-002', '2026-09-20', '2026-09-20'),
  (@Assign2, 1500.00, 'USD', N'paid',     N'paypal',        N'TXN-202610-003', '2026-10-09', '2026-10-09'),
  (@Assign3, 1300.00, 'USD', N'pending',  N'card',          N'TXN-202611-004', '2026-11-05', NULL),
  (@Assign3,  300.00, 'USD', N'failed',   N'paypal',        N'TXN-202611-005', '2026-11-06', NULL);

INSERT INTO dbo.Reviews (ProjectID, ReviewerID, RevieweeID, Rating, Comment, CreatedAt)
VALUES
  (@Proj1, @Client1, @Free2,   5, N'Accurate RAG responses and clean documentation.', '2026-09-05'),
  (@Proj1, @Free2,   @Client1, 5, N'Clear requirements and fast milestone approval.', '2026-09-06'),
  (@Proj2, @Client2, @Free1,   4, N'Strong anomaly detection accuracy, minor delay.', '2026-10-10'),
  (@Proj2, @Free1,   @Client2, 5, N'Great communication throughout the sprint.',      '2026-10-11');

INSERT INTO dbo.Disputes (ProjectID, RaisedByUserID, Subject, Description, Status, CreatedAt, ResolvedAt)
VALUES
  (@Proj3, @Client1, N'Milestone delivery delay', N'Initial CV prototype was 3 days behind schedule.', N'open',          '2026-11-10', NULL),
  (@Proj2, @Free1,   N'Clarification on payout',  N'Second bank transfer took extra verification.',    N'resolved',      '2026-10-08', '2026-10-09');

COMMIT TRANSACTION;
GO