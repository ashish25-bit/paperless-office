let users = [] // this will contain the users joined in a chat room with their socket id
let allUsers = [] // this will contain the id and the socket of the particular user

function joinUser (room,id) {
    user = {room,id}
    users.push(user)
    return user
}

function removeUser(id) {
    // remove from users array
    for(i=0;i<users.length;i++) {
        if(users[i].id == id) {
            users.splice(i,1)[0]
            i--
        }
    }

    // remove from allusers array
    index = allUsers.findIndex(user => user.id == id)
    allUsers.splice(index,1)[0]
}

function findUser(room,id) {
    return users.findIndex(user => user.room == room && user.id == id)
}

function showRoom() {
    console.log(users)
}

function userJoin(id,sid) {
    u = {id, sid}
    allUsers.push(u)
    // console.log(allUsers)
}

function findUserAll(id) {
    return allUsers.find(user => user.id == id)
}

module.exports = {joinUser,removeUser,findUser,showRoom,userJoin,findUserAll}