const express = require('express')
const path = require('path')
const session = require('express-session')
const pageRouter = require('./routes/pages')
const socketio = require('socket.io') 
const http = require('http')
const {joinUser,removeUser,findUser,showRoom,userJoin,findUserAll} = require('./utils/users')
const User = require('./core/user') 

const uu = new User()
const app = express()
const server = http.createServer(app)
const io = socketio(server)

// for body parser
app.use(express.urlencoded({ extended : false }))
//server static files
app.use(express.static(path.join(__dirname, 'public')))

//set template engine 
app.set('views' , path.join(__dirname, 'views'))
app.set('view engine' , 'pug')

app.use(session({
    secret:'paperless_office',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 1000 * 30}
}))

// to get the login page
app.use('/' , pageRouter)

//errors
app.use((req,res,next) => {
    var err = new Error('Page Not found')
    err.status = 404
    next(err)
})

//handling error
app.use((err,req,res,next) => {
    res.status(err.status || 500)
    res.send(err.message)
})

io.on('connection', socket => {
    // to make a room for the connections
    socket.on('joinRoom' , rooms => {
        rooms.forEach(e => {
            user = joinUser(e,socket.id)
            socket.join(user.room)
        })
    })

    // checking the user when he is disconnected
    socket.on('disconnect' , () => removeUser(socket.id))

    // to send the message to all the users who are connected in a room for personal chat
    socket.on('sendmsg' , info => socket.broadcast.to(info.room).emit('message', {msg : info.msg , room : info.room}) )

    // to send the message to all the users who are connected in a room for group chat
    socket.on('sendGroupmsg' , info => socket.broadcast.to(info.room).emit('messageGroup', {msg : info.msg , from : info.name, room : info.room}) )

    // join the user to the all users database
    socket.on('join', id => userJoin(id,socket.id) )

    // to show all the rooms
    socket.on('showRoom' , () => showRoom())

    // added to the group
    socket.on('added' , info => {
        user = findUserAll(info.id) 
        if(user != undefined)
            io.to(user.sid).emit('addedGroup', {room:info.room})
    })
})

// setting up the server
const PORT = 3000 || process.env.PORT
server.listen(PORT , () => console.log(`Server running on port ${PORT}`)) 