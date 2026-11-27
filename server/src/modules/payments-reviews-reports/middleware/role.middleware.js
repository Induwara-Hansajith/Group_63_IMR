const AppError = require('../utils/AppError');

//Restricts access to specific roles: 'freelancer', 'client', 'admin', 'manager'//
function authorizeRoles(...allowedRoles) {
  const normalized = allowedRoles.map((r) => r.toLowerCase());
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!normalized.includes(req.user.role)) {
      return next(
        new AppError(`Access denied. Allowed roles: ${normalized.join(', ')}.`, 403)
      );
    }
    return next();
  };
}
module.exports = { authorizeRoles };