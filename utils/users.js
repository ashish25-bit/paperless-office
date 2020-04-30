let users = [] // this will contain the users joined in a chat room with their socket id
let allUsers = [] // this will contain the id and the socket of the particular user
let user_docs = [] // this will contain the users in a room of the editor

function joinUser (room,id) {
    user = {room,id}
    users.push(user)
    return user
}

function removeUser(id) {
    // for the chat room
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

    // for the document
    // remove the user from the user_doc array
    ii = user_docs.findIndex(user => user.id == id)
    user_docs.splice(ii,1)[0]
}

function findUser(id) {
    return user_docs.find(user => user.id == id)
}

function showRoom() {
    console.log(users)
}

function userJoin(id,sid) {
    u = {id, sid}
    allUsers.push(u)
}

function findUserAll(id) {
    return allUsers.find(user => user.id == id)
}

// for joining the user to the room a document editor
function joinDoc(room,id) {
    user = {room,id}
    user_docs.push(user)
    return user
}

module.exports = {joinUser,removeUser,findUser,showRoom,userJoin,findUserAll,joinDoc}