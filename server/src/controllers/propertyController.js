const prisma = require('../lib/prisma');
const lockRoom = require('../lib/room-lock');
const { audit } = require('../lib/domain');
const { expireReservations } = require('../lib/reservations');
const propertyDetails = { rooms: true, owner: { select: { name: true, email: true } } };

// Get all properties (with optional filters)
const getProperties = async (req, res) => {
    try {
        await expireReservations();
        const properties = await prisma.property.findMany({
            include: propertyDetails,
            orderBy: { id: 'asc' },
        });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
};

const getProperty = async (req, res) => {
    try {
        await expireReservations();
        const property = await prisma.property.findUnique({
            where: { id: req.params.propertyId }, include: propertyDetails,
        });
        if (!property) return res.status(404).json({ error: 'Property not found' });
        res.json(property);
    } catch {
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
};

// Create a new property (Hostel/PG)
const createProperty = async (req, res) => {
    try {
        const { name, address, city, type, rules, hasMess } = req.body;
        const ownerId = req.user.userId; // From authMiddleware

        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only Admins can list properties' });
        }

        const property = await prisma.$transaction(async tx => {
        const created = await tx.property.create({
            data: {
                name, address, city, type, rules, hasMess, ownerId
            }
        });
        await audit(tx, req.user, 'CREATE_PROPERTY', 'Property', created.id, 'สร้างข้อมูลหอพัก');
        return created;
        });
        res.status(201).json(property);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create property' });
    }
};

// Add a room to a property
const addRoom = async (req, res) => {
    try {
        const { propertyId, roomNumber, capacity, price, type } = req.body;

        const property = await prisma.property.findUnique({ where: { id: propertyId } });
        if (!property) return res.status(404).json({ error: 'Property not found' });

        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized to add rooms to this property' });
        }

        const room = await prisma.$transaction(async tx => {
        const created = await tx.room.create({
            data: {
                propertyId,
                roomNumber,
                capacity,
                price,
                type,
                isAvailable: true // Default to available
            }
        });
        await audit(tx, req.user, 'CREATE_ROOM', 'Room', created.id, 'เพิ่มห้องพัก');
        return created;
        });
        res.status(201).json(room);
    } catch (error) {
        if (error.code === 'P2002') return res.status(409).json({ error: 'Room number already exists in this property' });
        res.status(500).json({ error: 'Failed to add room' });
    }
};

// specific endpoints for students to find rooms
const getAvailableRooms = async (req, res) => {
    try {
        await expireReservations();
        const rooms = await prisma.room.findMany({
            where: { isAvailable: true, isActive: true },
            include: { property: true }
        });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

const updateProperty = async (req, res) => {
    try {
        const { name, address, city, type, rules, hasMess } = req.body;
        const property = await prisma.$transaction(async tx => {
        const updated = await tx.property.update({
            where: { id: req.params.propertyId },
            data: { name, address, city, type, rules, hasMess },
        });
        await audit(tx, req.user, 'EDIT_PROPERTY', 'Property', updated.id, 'แก้ไขข้อมูลหอพัก');
        return updated;
        });
        res.json(property);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Property not found' });
        res.status(500).json({ error: 'Failed to update property' });
    }
};

const roomFailure = (res, error) => {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Room number already exists in this property' });
    if (['P2034', 'P1008', 'P2028'].includes(error.code)) {
        return res.status(409).json({ error: 'Room changed. Refresh and try again' });
    }
    res.status(500).json({ error: 'Failed to update room' });
};

const updateRoom = async (req, res) => {
    try {
        const { roomNumber, capacity, price, type } = req.body;
        const result = await prisma.$transaction(async tx => {
            await lockRoom(tx, req.params.roomId);
            const room = await tx.room.findUnique({ where: { id: req.params.roomId } });
            if (!room) return { status: 404, error: 'Room not found' };
            const changesDetails = roomNumber !== room.roomNumber || capacity !== room.capacity || type !== room.type;
            if (changesDetails && (await tx.booking.count({ where: { roomId: room.id, status: 'CONFIRMED' } }) || await tx.lease.count({ where: { activeRoomId: room.id } }))) {
                return { status: 409, error: 'Cannot change room details while a confirmed booking exists' };
            }
            // Only the base rent changes; existing booking quotes are never rewritten.
            const updated = await tx.room.update({ where: { id: room.id }, data: { roomNumber, capacity, price, type } });
            await audit(tx, req.user, 'EDIT_ROOM', 'Room', room.id, 'แก้ไขข้อมูลห้องและค่าเช่าสำหรับคำขอใหม่');
            return { room: updated };
        });
        if (result.error) return res.status(result.status).json({ error: result.error });
        res.json(result.room);
    } catch (error) { roomFailure(res, error); }
};

const setRoomActive = async (req, res) => {
    try {
        const result = await prisma.$transaction(async tx => {
            await lockRoom(tx, req.params.roomId);
            const room = await tx.room.findUnique({ where: { id: req.params.roomId } });
            if (!room) return { status: 404, error: 'Room not found' };
            if (!req.body.isActive && (await tx.booking.count({
                where: { roomId: room.id, status: { in: ['PENDING', 'CONFIRMED'] } },
            }) || await tx.lease.count({ where: { activeRoomId: room.id } }))) return { status: 409, error: 'Resolve pending or confirmed bookings before closing this room' };
            const updated = await tx.room.update({ where: { id: room.id }, data: { isActive: req.body.isActive } });
            await audit(tx, req.user, 'ROOM_SERVICE_STATUS', 'Room', room.id, req.body.isActive ? 'เปิดใช้งานห้อง' : 'ปิดใช้งานห้อง');
            return { room: updated };
        });
        if (result.error) return res.status(result.status).json({ error: result.error });
        res.json(result.room);
    } catch (error) { roomFailure(res, error); }
};

module.exports = { getProperties, getProperty, createProperty, addRoom, getAvailableRooms, updateProperty, updateRoom, setRoomActive };
