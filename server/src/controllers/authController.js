const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');
const prisma = require('../lib/prisma');
const { jwtSecret } = require('../config');
const { hashToken, publicUser, isSupportedRole } = require('../lib/session');

const register = async (req, res) => {
    try {
        const { email, password, name, phone, address } = req.body;
        if (req.body.role !== undefined && req.body.role !== 'USER') {
            return res.status(400).json({ error: 'Public registration only supports USER' });
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(409).json({ error: 'User already exists' });
        const user = await prisma.user.create({
            data: { email, password: await bcrypt.hash(password, 10), name, role: 'USER', phone, address },
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
        await prisma.authSession.create({ data: {
            id: sessionId, userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(claims.exp * 1000),
        } });
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
        await prisma.authSession.updateMany({
            where: { id: req.sessionId, revokedAt: null }, data: { revokedAt: new Date() },
        });
        res.json({ message: 'Logged out successfully' });
    } catch {
        res.status(500).json({ error: 'Logout failed. Please try again.' });
    }
};

module.exports = { register, login, me, logout };
