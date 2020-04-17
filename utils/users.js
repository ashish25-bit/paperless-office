let users = []

function joinUser (room,id) {
    user = {room,id}
    users.push(user)
    return user
}

function removeUser(id) {
    index = users.findIndex(user => user.id == id)
    users.splice(index,1)[0]
}

function findUser(room,id) {
    return users.findIndex(user => user.room == room && user.id == id)
}

function showRoom() {
    console.log(users)
}

module.exports = {joinUser,removeUser,findUser,showRoom}