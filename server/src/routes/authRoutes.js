const express = require('express');
const { register, login, me, logout } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const router = express.Router();
const email = () => body('email').isString().bail().trim().toLowerCase().isEmail().isLength({ max: 254 }).withMessage('Please include a valid email');
const password = () => body('password').isString().bail().isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .custom(value => Buffer.byteLength(value, 'utf8') <= 72).withMessage('Password must be at most 72 UTF-8 bytes');
router.post('/register', [
    email(), password(),
    body('name').isString().bail().trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
    body('role').optional().isIn(['USER']).withMessage('Public registration only supports USER'),
    body('phone').optional().isString().bail().trim().isLength({ max: 30 }),
    body('address').optional().isString().bail().trim().isLength({ max: 500 }),
], validate, register);
router.post('/login', [
    email(),
    body('password').isString().bail().notEmpty().custom(value => Buffer.byteLength(value, 'utf8') <= 72),
], validate, login);
router.get('/me', authenticateToken, me);
router.post('/logout', authenticateToken, logout);
module.exports = router;
