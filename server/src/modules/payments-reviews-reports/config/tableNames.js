// Central registry of all MS SQL Server tables from AIFreelancerDB.sql.
const TABLES = {
  // Member 1 (Auth & Profiles)
  ROLES: 'dbo.Roles',
  USERS: 'dbo.Users',
  FREELANCER_PROFILES: 'dbo.FreelancerProfiles',
  CLIENT_PROFILES: 'dbo.ClientProfiles',

  // Member 2 (Skills & Services)
  SKILL_CATEGORIES: 'dbo.SkillCategories',
  AI_SKILLS: 'dbo.AISkills',
  SERVICE_CATEGORIES: 'dbo.ServiceCategories',
  AI_SERVICES: 'dbo.AIServices',
  FREELANCER_SKILLS: 'dbo.FreelancerSkills',
  FREELANCER_SERVICES: 'dbo.FreelancerServices',

  // Member 3 (Projects)
  PROJECTS: 'dbo.Projects',
  PROJECT_REQUIREMENTS: 'dbo.ProjectRequirements',
  PROJECT_REQUIRED_SKILLS: 'dbo.ProjectRequiredSkills',
  PROJECT_REQUIRED_SERVICES: 'dbo.ProjectRequiredServices',

  // Member 4 (Proposals & Assignments)
  PROPOSALS: 'dbo.Proposals',
  ASSIGNMENTS: 'dbo.ProjectAssignments',

  // Member 5 (Your tables & view)
  PAYMENTS: 'dbo.Payments',
  REVIEWS: 'dbo.Reviews',
  DISPUTES: 'dbo.Disputes',
  VW_PROJECT_PAYMENT_SUMMARY: 'dbo.vw_ProjectPaymentSummary',
};

module.exports = { TABLES };