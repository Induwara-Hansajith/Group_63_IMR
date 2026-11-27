const AppError = require('../utils/AppError');
const adminModel = require('../models/admin.model');

const VALID_ACCOUNT_STATUSES = ['active', 'suspended', 'closed'];
const VALID_DISPUTE_STATUSES = ['open', 'investigating', 'resolved', 'closed'];

async function getUsers(filters) {
  return adminModel.listUsers(filters);
}

async function changeUserAccountStatus(currentAdmin, targetUserId, nextStatus) {
  const user = await adminModel.findUserById(targetUserId);
  if (!user) {
    throw new AppError('User account not found.', 404);
  }

  if (Number(currentAdmin.id) === Number(targetUserId) && nextStatus !== 'active') {
    throw new AppError('You cannot suspend or close your own admin account.', 400);
  }

  return adminModel.updateUserAccountStatus(targetUserId, nextStatus);
}

async function getSkillCategories() {
  return adminModel.listSkillCategories();
}

async function addSkillCategory(categoryName) {
  return adminModel.createSkillCategory(categoryName.trim());
}

async function editSkillCategory(categoryId, categoryName) {
  const updated = await adminModel.updateSkillCategory(categoryId, categoryName.trim());
  if (!updated) {
    throw new AppError('Skill category not found.', 404);
  }
  return updated;
}

async function removeSkillCategory(categoryId) {
  const deleted = await adminModel.deleteSkillCategory(categoryId);
  if (!deleted) {
    throw new AppError('Skill category not found.', 404);
  }
  return deleted;
}

async function getServiceCategories() {
  return adminModel.listServiceCategories();
}

async function addServiceCategory(categoryName) {
  return adminModel.createServiceCategory(categoryName.trim());
}

async function editServiceCategory(categoryId, categoryName) {
  const updated = await adminModel.updateServiceCategory(categoryId, categoryName.trim());
  if (!updated) {
    throw new AppError('Service category not found.', 404);
  }
  return updated;
}

async function removeServiceCategory(categoryId) {
  const deleted = await adminModel.deleteServiceCategory(categoryId);
  if (!deleted) {
    throw new AppError('Service category not found.', 404);
  }
  return deleted;
}

async function fileDispute(currentUser, { projectId, subject, description }) {
  const project = await adminModel.getProjectParticipants(projectId);
  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  const userId = Number(currentUser.id);
  const isClient = Number(project.ClientID) === userId;
  const isAssignedFreelancer =
    project.FreelancerID !== null && Number(project.FreelancerID) === userId;

  if (!isClient && !isAssignedFreelancer) {
    throw new AppError(
      'You can only file a dispute for a project you participate in.',
      403
    );
  }

  return adminModel.createDispute({
    projectId: Number(projectId),
    raisedByUserId: userId,
    subject: subject.trim(),
    description: description.trim(),
  });
}

async function getMyDisputes(currentUser, status) {
  return adminModel.listDisputes({ status, userId: currentUser.id });
}

async function getAllDisputes(status) {
  return adminModel.listDisputes({ status });
}

async function changeDisputeStatus(disputeId, nextStatus) {
  const dispute = await adminModel.findDisputeById(disputeId);
  if (!dispute) {
    throw new AppError('Dispute not found.', 404);
  }

  return adminModel.updateDisputeStatus(disputeId, nextStatus);
}

module.exports = {
  VALID_ACCOUNT_STATUSES,
  VALID_DISPUTE_STATUSES,
  getUsers,
  changeUserAccountStatus,
  getSkillCategories,
  addSkillCategory,
  editSkillCategory,
  removeSkillCategory,
  getServiceCategories,
  addServiceCategory,
  editServiceCategory,
  removeServiceCategory,
  fileDispute,
  getMyDisputes,
  getAllDisputes,
  changeDisputeStatus,
};