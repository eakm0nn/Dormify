const express = require('express');
const { createBooking, getOwnerBookings, getBookingSummary, updateBookingStatus, getMyBookings } = require('../controllers/bookingController');
const authenticateToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { bodyId, paramId, queryId } = require('../lib/validation');
const router = express.Router();

router.post('/', authenticateToken, authorize('USER'), [
    bodyId('roomId'),
    body('startDate', 'Start date must be valid').isString().bail().isISO8601({ strict: true }).toDate(),
    body('endDate', 'End date must be valid').isString().bail().isISO8601({ strict: true }).bail().toDate()
        .custom((value, { req }) => value > req.body.startDate)
        .withMessage('End date must be after start date')
], validate, createBooking);

router.get('/summary', authenticateToken, authorize('ADMIN'), queryId('propertyId'), validate, getBookingSummary);
router.get('/admin', authenticateToken, authorize('ADMIN'), getOwnerBookings);
router.get('/owner', authenticateToken, authorize('ADMIN'), getOwnerBookings); // Legacy URL, Admin only
router.put('/:bookingId/status', authenticateToken, authorize('ADMIN'), [
    paramId('bookingId'),
    body('status', 'Invalid booking status').isIn(['CONFIRMED', 'REJECTED', 'CANCELLED']),
], validate, updateBookingStatus);
router.get('/my-bookings', authenticateToken, authorize('USER'), getMyBookings);

module.exports = router;
