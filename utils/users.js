let users = []

function joinUser (id,room) {
    user = {room,id}
    users.push(user)
    console.log(users)
    return user
}

function findUser(id,room) {
    return users.find(user => user.id == id && user.room == room)
}

function removeUser(id) {
    index = users.findIndex(user => user.id == id)
    users.splice(index,1)[0]
}

module.exports = {joinUser,findUser,removeUser}