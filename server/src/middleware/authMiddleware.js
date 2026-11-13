const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const prisma = require('../lib/prisma');
const { hashToken, isSupportedRole } = require('../lib/session');

const authenticateToken = async (req, res, next) => {
    const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '');
    if (!match) return res.status(401).json({ error: 'Authentication required' });
    const token = match[1];
    let claims;
    try {
        claims = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    } catch {
        return res.status(401).json({ error: 'Invalid or expired session' });
    }
    if (!claims || !Number.isSafeInteger(claims.userId) || typeof claims.jti !== 'string') {
        return res.status(401).json({ error: 'Invalid session' });
    }
    try {
        const session = await prisma.authSession.findUnique({ where: { id: claims.jti }, include: { user: true } });
        if (!session || session.revokedAt || session.expiresAt <= new Date() ||
            session.tokenHash !== hashToken(token) || session.userId !== claims.userId ||
            !isSupportedRole(session.user.role) || session.user.role !== claims.role) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        req.user = { ...session.user, userId: session.userId };
        req.sessionId = session.id;
        next();
    } catch {
        res.status(503).json({ error: 'Unable to verify session. Please try again.' });
    }
};

module.exports = authenticateToken;
