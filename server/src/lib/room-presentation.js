const photoSelection = { select: { id: true }, orderBy: { id: 'asc' } };
const presentRoom = (room) => {
    if (!room) return room;
    const { photos, ...data } = room;
    return {
        ...data,
        amenities: room.amenities || [],
        images: (photos || []).map(
            (photo) => '/api/properties/room-photos/' + photo.id,
        ),
    };
};
const presentProperty = (property) => ({
    ...property,
    amenities: property.amenities || [],
    rooms: property.rooms.map(presentRoom),
});
module.exports = { photoSelection, presentRoom, presentProperty };
