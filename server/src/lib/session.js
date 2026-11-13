const { createHash } = require('node:crypto');

const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });
const isSupportedRole = (role) => ['ADMIN', 'USER'].includes(role);

module.exports = { hashToken, publicUser, isSupportedRole };
