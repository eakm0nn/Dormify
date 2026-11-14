const express = require('express');
const { getProperties, getProperty, createProperty, addRoom, getAvailableRooms, updateProperty, updateRoom, setRoomActive } = require('../controllers/propertyController');
const authenticateToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { bodyId, paramId } = require('../lib/validation');
const router = express.Router();

router.get('/', getProperties); // Public or filtered
router.get('/available-rooms', getAvailableRooms); // Public for tenants
router.get('/:propertyId', paramId('propertyId'), validate, getProperty);

const allowedFields = fields => body().custom(value => value && !Array.isArray(value) &&
    Object.keys(value).every(key => fields.includes(key))).withMessage('Unsupported fields');

const propertyFields = () => [
    body('name').isString().bail().trim().isLength({ min: 1, max: 200 }).withMessage('Property name is required'),
    body('address').isString().bail().trim().isLength({ min: 1, max: 500 }).withMessage('Address is required'),
    body('city').isString().bail().trim().isLength({ min: 1, max: 100 }).withMessage('City is required'),
    body('type', 'Invalid property type').isIn(['HOSTEL', 'PG', 'FLAT']),
    body('rules').optional().isString().bail().trim().isLength({ max: 5000 }),
    body('hasMess').optional().custom(value => typeof value === 'boolean').withMessage('Food service must be a boolean'),
];

const roomFields = () => [
    body('roomNumber').isString().bail().trim().isLength({ min: 1, max: 50 }).withMessage('Room number is required'),
    body('capacity', 'Capacity must be a positive integer')
        .custom(value => typeof value === 'number' || typeof value === 'string').bail().isInt({ min: 1, max: 2147483647 }).bail()
        .custom(value => Number.isSafeInteger(Number(value))).toInt(),
    body('price', 'Price must be between 0 and 9999999999.99 with at most 2 decimal places')
        .custom(value => typeof value === 'number' || typeof value === 'string').bail()
        .custom(value => /^\d+(\.\d{1,2})?$/.test(String(value)) && Number(value) <= 9999999999.99),
    body('type', 'Invalid room type').isIn(['AC', 'NON-AC'])
];

router.post('/', authenticateToken, authorize('ADMIN'), propertyFields(), validate, createProperty);
router.put('/:propertyId', authenticateToken, authorize('ADMIN'), paramId('propertyId'),
    allowedFields(['name', 'address', 'city', 'type', 'rules', 'hasMess']), propertyFields(), validate, updateProperty);
router.post('/rooms', authenticateToken, authorize('ADMIN'), [bodyId('propertyId'), ...roomFields()], validate, addRoom);
router.put('/rooms/:roomId', authenticateToken, authorize('ADMIN'), paramId('roomId'),
    allowedFields(['roomNumber', 'capacity', 'price', 'type']), roomFields(), validate, updateRoom);
router.patch('/rooms/:roomId/status', authenticateToken, authorize('ADMIN'), paramId('roomId'), [
    allowedFields(['isActive']),
    body('isActive').custom(value => typeof value === 'boolean').withMessage('Room active status must be a boolean'),
], validate, setRoomActive);

module.exports = router;
