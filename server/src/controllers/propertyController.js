const prisma = require('../lib/prisma');
const propertyDetails = { rooms: true, owner: { select: { name: true, email: true } } };

// Get all properties (with optional filters)
const getProperties = async (req, res) => {
    try {
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

        const property = await prisma.property.create({
            data: {
                name, address, city, type, rules, hasMess, ownerId
            }
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

        const room = await prisma.room.create({
            data: {
                propertyId,
                roomNumber,
                capacity,
                price,
                type,
                isAvailable: true // Default to available
            }
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
        const rooms = await prisma.room.findMany({
            where: { isAvailable: true },
            include: { property: true }
        });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

module.exports = { getProperties, getProperty, createProperty, addRoom, getAvailableRooms };
