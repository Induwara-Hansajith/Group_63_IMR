const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

//Verifies the Bearer JWT issued by Member 1's login route.Normalizes req.user to { id, role, email }.//
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token is required.', 401));
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: Number(decoded.userId ?? decoded.UserID ?? decoded.id),
      role: String(decoded.role ?? decoded.RoleName ?? '').toLowerCase(),
      email: decoded.email ?? decoded.Email ?? null,
    };
    if (!req.user.id || !req.user.role) {
      return next(new AppError('Invalid token payload.', 401));
    }
    return next();
  } catch (err) {
    return next(new AppError('Invalid or expired authentication token.', 401));
  }
}
module.exports = { authenticate };