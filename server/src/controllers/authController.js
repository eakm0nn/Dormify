const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');
const prisma = require('../lib/prisma');
const { jwtSecret } = require('../config');
const { hashToken, publicUser, isSupportedRole } = require('../lib/session');
const { audit } = require('../lib/domain');

const register = async (req, res) => {
    try {
        const { email, password, name, phone, address } = req.body;
        if (req.body.role !== undefined && req.body.role !== 'USER') {
            return res.status(400).json({ error: 'Public registration only supports USER' });
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(409).json({ error: 'User already exists' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.$transaction(async tx => {
            const created = await tx.user.create({ data: { email, password: hashedPassword, name, role: 'USER', phone, address } });
            await audit(tx, { userId: created.id, name: created.name }, 'REGISTER', 'User', created.id, 'สมัครบัญชีผู้ใช้งาน');
            return created;
        });
        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        if (error.code === 'P2002') return res.status(409).json({ error: 'User already exists' });
        res.status(500).json({ error: 'Registration failed' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Legacy OWNER/TENANT records are never silently promoted or trusted.
        if (!isSupportedRole(user.role)) {
            return res.status(403).json({ error: 'This account role requires administrator review' });
        }
        const sessionId = randomUUID();
        const token = jwt.sign({ userId: user.id, role: user.role }, jwtSecret, {
            algorithm: 'HS256', expiresIn: '1d', jwtid: sessionId,
        });
        const claims = jwt.decode(token);
        await prisma.$transaction(async tx => {
            await tx.authSession.create({ data: { id: sessionId, userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(claims.exp * 1000) } });
            await audit(tx, { userId: user.id, name: user.name }, 'LOGIN', 'User', user.id, 'เข้าสู่ระบบสำเร็จ');
        });
        res.set('Cache-Control', 'no-store');
        res.json({ token, user: publicUser(user) });
    } catch {
        res.status(500).json({ error: 'Login failed' });
    }
};

const me = (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({ user: publicUser(req.user) });
};

const logout = async (req, res) => {
    try {
        await prisma.$transaction(async tx => {
            await tx.authSession.updateMany({ where: { id: req.sessionId, revokedAt: null }, data: { revokedAt: new Date() } });
            await audit(tx, req.user, 'LOGOUT', 'User', req.user.userId, 'ออกจากระบบ');
        });
        res.json({ message: 'Logged out successfully' });
    } catch {
        res.status(500).json({ error: 'Logout failed. Please try again.' });
    }
};

module.exports = { register, login, me, logout };
