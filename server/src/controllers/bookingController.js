const prisma = require('../lib/prisma');

class BookingError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const bookingFailure = (res, error, fallback) => {
    if (error instanceof BookingError) return res.status(error.status).json({ error: error.message });
    // A contending SQLite transaction must be retried as a whole.
    if (['P2034', 'P1008', 'P2028'].includes(error.code)) {
        return res.status(409).json({ error: 'Booking changed. Refresh and try again' });
    }
    console.error(error);
    return res.status(500).json({ error: fallback });
};

const createBooking = async (req, res) => {
    try {
        const { roomId, startDate, endDate } = req.body;
        const booking = await prisma.$transaction(async tx => {
            const room = await tx.room.findUnique({ where: { id: roomId } });
            if (!room || !room.isAvailable) throw new BookingError(409, 'Room not available');
            return tx.booking.create({
                data: {
                    userId: req.user.userId, roomId, startDate, endDate,
                    status: 'PENDING',
                    // Monthly rent quoted in the request; not an invoice total.
                    totalAmount: room.price,
                },
            });
        });
        res.status(201).json({ message: 'Booking request sent', booking });
    } catch (error) {
        bookingFailure(res, error, 'Failed to create booking');
    }
};

const getOwnerBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: { user: { select: { name: true, email: true } }, room: true },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
        res.json(bookings);
    } catch {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

const getBookingSummary = async (req, res) => {
    try {
        const propertyId = Number(req.query.propertyId);
        const property = await prisma.property.findUnique({ where: { id: propertyId }, select: { id: true } });
        if (!property) return res.status(404).json({ error: 'Property not found' });
        const [totalRooms, availableRooms, pendingBookings] = await prisma.$transaction([
            prisma.room.count({ where: { propertyId } }),
            prisma.room.count({ where: { propertyId, isAvailable: true } }),
            prisma.booking.count({ where: { status: 'PENDING', room: { propertyId } } }),
        ]);
        res.json({ totalRooms, availableRooms, pendingBookings });
    } catch {
        res.status(500).json({ error: 'Failed to fetch booking summary' });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        const result = await prisma.$transaction(async tx => {
            const booking = await tx.booking.findUnique({ where: { id: bookingId } });
            if (!booking) throw new BookingError(404, 'Booking not found');
            // Preserve rejection/cancellation of confirmed requests, but never
            // reactivate a rejected/cancelled request or confirm twice.
            const allowed = status === 'CONFIRMED' ? ['PENDING'] : ['PENDING', 'CONFIRMED'];
            if (!allowed.includes(booking.status)) throw new BookingError(409, 'Booking changed. Refresh and try again');

            if (status === 'CONFIRMED') {
                const claimed = await tx.room.updateMany({
                    where: {
                        id: booking.roomId, isAvailable: true,
                        bookings: { none: { status: 'CONFIRMED' } },
                    },
                    data: { isAvailable: false },
                });
                if (claimed.count !== 1) throw new BookingError(409, 'Room not available');
            }

            const changed = await tx.booking.updateMany({
                where: { id: bookingId, status: booking.status }, data: { status },
            });
            if (changed.count !== 1) throw new BookingError(409, 'Booking changed. Refresh and try again');

            if (booking.status === 'CONFIRMED' && status !== 'CONFIRMED') {
                // A legacy conflicting confirmed request must keep the room occupied.
                await tx.room.updateMany({
                    where: { id: booking.roomId, bookings: { none: { status: 'CONFIRMED' } } },
                    data: { isAvailable: true },
                });
            }
            return tx.booking.findUnique({ where: { id: bookingId } });
        });
        res.json({ message: `Booking ${status}`, booking: result });
    } catch (error) {
        bookingFailure(res, error, 'Failed to update booking');
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: req.user.userId },
            include: { room: { include: { property: true } } },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
        res.json(bookings);
    } catch {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

module.exports = { createBooking, getOwnerBookings, getBookingSummary, updateBookingStatus, getMyBookings };
