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


module.exports = {joinUser,removeUser}