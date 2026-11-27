const adminService = require('../services/admin.service');
const { sendResponse } = require('../utils/response');

async function listUsers(req, res, next) {
  try {
    const users = await adminService.getUsers({
      role: req.query.role,
      status: req.query.status,
    });
    return sendResponse(res, 200, 'Users retrieved successfully.', users);
  } catch (err) {
    return next(err);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const updated = await adminService.changeUserAccountStatus(
      req.user,
      Number(req.params.userId),
      req.body.status
    );
    return sendResponse(res, 200, 'Account status updated successfully.', updated);
  } catch (err) {
    return next(err);
  }
}

async function listSkillCategories(req, res, next) {
  try {
    const categories = await adminService.getSkillCategories();
    return sendResponse(res, 200, 'Skill categories retrieved successfully.', categories);
  } catch (err) {
    return next(err);
  }
}

async function createSkillCategory(req, res, next) {
  try {
    const created = await adminService.addSkillCategory(req.body.categoryName);
    return sendResponse(res, 201, 'Skill category created successfully.', created);
  } catch (err) {
    return next(err);
  }
}

async function updateSkillCategory(req, res, next) {
  try {
    const updated = await adminService.editSkillCategory(
      Number(req.params.id),
      req.body.categoryName
    );
    return sendResponse(res, 200, 'Skill category updated successfully.', updated);
  } catch (err) {
    return next(err);
  }
}

async function deleteSkillCategory(req, res, next) {
  try {
    const deleted = await adminService.removeSkillCategory(Number(req.params.id));
    return sendResponse(res, 200, 'Skill category deleted successfully.', deleted);
  } catch (err) {
    return next(err);
  }
}

async function listServiceCategories(req, res, next) {
  try {
    const categories = await adminService.getServiceCategories();
    return sendResponse(res, 200, 'Service categories retrieved successfully.', categories);
  } catch (err) {
    return next(err);
  }
}

async function createServiceCategory(req, res, next) {
  try {
    const created = await adminService.addServiceCategory(req.body.categoryName);
    return sendResponse(res, 201, 'Service category created successfully.', created);
  } catch (err) {
    return next(err);
  }
}

async function updateServiceCategory(req, res, next) {
  try {
    const updated = await adminService.editServiceCategory(
      Number(req.params.id),
      req.body.categoryName
    );
    return sendResponse(res, 200, 'Service category updated successfully.', updated);
  } catch (err) {
    return next(err);
  }
}

async function deleteServiceCategory(req, res, next) {
  try {
    const deleted = await adminService.removeServiceCategory(Number(req.params.id));
    return sendResponse(res, 200, 'Service category deleted successfully.', deleted);
  } catch (err) {
    return next(err);
  }
}

async function createDispute(req, res, next) {
  try {
    const dispute = await adminService.fileDispute(req.user, req.body);
    return sendResponse(res, 201, 'Dispute filed successfully.', dispute);
  } catch (err) {
    return next(err);
  }
}

async function listMyDisputes(req, res, next) {
  try {
    const disputes = await adminService.getMyDisputes(req.user, req.query.status);
    return sendResponse(res, 200, 'Your disputes retrieved successfully.', disputes);
  } catch (err) {
    return next(err);
  }
}

async function listAllDisputes(req, res, next) {
  try {
    const disputes = await adminService.getAllDisputes(req.query.status);
    return sendResponse(res, 200, 'Disputes retrieved successfully.', disputes);
  } catch (err) {
    return next(err);
  }
}

async function updateDisputeStatus(req, res, next) {
  try {
    const updated = await adminService.changeDisputeStatus(
      Number(req.params.disputeId),
      req.body.status
    );
    return sendResponse(res, 200, 'Dispute status updated successfully.', updated);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listUsers,
  updateUserStatus,
  listSkillCategories,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory,
  listServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  createDispute,
  listMyDisputes,
  listAllDisputes,
  updateDisputeStatus,
};