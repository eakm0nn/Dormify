const express = require('express');
const { getProperties, getProperty, createProperty, addRoom, getAvailableRooms } = require('../controllers/propertyController');
const authenticateToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { bodyId, paramId } = require('../lib/validation');
const router = express.Router();

router.get('/', getProperties); // Public or filtered
router.get('/available-rooms', getAvailableRooms); // Public for tenants
router.get('/:propertyId', paramId('propertyId'), validate, getProperty);

router.post('/', authenticateToken, authorize('ADMIN'), [
    body('name').isString().bail().trim().isLength({ min: 1, max: 200 }).withMessage('Property name is required'),
    body('address').isString().bail().trim().isLength({ min: 1, max: 500 }).withMessage('Address is required'),
    body('city').isString().bail().trim().isLength({ min: 1, max: 100 }).withMessage('City is required'),
    body('type', 'Invalid property type').isIn(['HOSTEL', 'PG', 'FLAT']),
    body('rules').optional().isString().bail().trim().isLength({ max: 5000 }),
    body('hasMess').optional().custom(value => typeof value === 'boolean').withMessage('Food service must be a boolean'),
], validate, createProperty);

router.post('/rooms', authenticateToken, authorize('ADMIN'), [
    bodyId('propertyId'),
    body('roomNumber').isString().bail().trim().isLength({ min: 1, max: 50 }).withMessage('Room number is required'),
    body('capacity', 'Capacity must be a positive integer')
        .custom(value => typeof value === 'number' || typeof value === 'string').bail().isInt({ min: 1, max: 2147483647 }).bail()
        .custom(value => Number.isSafeInteger(Number(value))).toInt(),
    body('price', 'Price must be a non-negative number')
        .custom(value => typeof value === 'number' || typeof value === 'string').bail().isFloat({ min: 0 }).bail()
        .custom(value => Number.isFinite(Number(value))).toFloat(),
    body('type', 'Invalid room type').isIn(['AC', 'NON-AC'])
], validate, addRoom);

module.exports = router;
