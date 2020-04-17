let users = []

function joinUser (room,id) {
    user = {room,id}
    users.push(user)
    return user
}

function removeUser(id) {
    for(i=0;i<users.length;i++) {
        if(users[i].id == id) {
            users.splice(i,1)[0]
            i--
        }
    }
}

function findUser(room,id) {
    return users.findIndex(user => user.room == room && user.id == id)
}

function showRoom() {
    console.log(users)
}

module.exports = {joinUser,removeUser,findUser,showRoom}