let rooms = []

function findRoom(room) {
    return (rooms.includes(room))
}

function makeRoom(room) {
    rooms.push(room)
    console.log(rooms)
}

module.exports = {findRoom,makeRoom}