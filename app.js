const express = require('express')
const path = require('path')
const session = require('express-session')
const pageRouter = require('./routes/pages')
const socketio = require('socket.io') 
const http = require('http')
const {findRoom,makeRoom} = require('./utils/room')
const {joinUser,findUser,removeUser} = require('./utils/users')

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
    
    // request to make the room or join if it is present
    socket.on('makeRoom' , room => {
        if(!findRoom(room))
            makeRoom(room)
        u = findUser(socket.id,room)
        if(u == undefined){
            const user = joinUser(socket.id,room)
            socket.join(user.room)
        }
    })

    // sending the messages between the 2 users
    // socket.broadcast.to(roomName) will send the message to all the users connected in the room except the sender
    socket.on('msg' , info => socket.broadcast.to(info.room).emit('message', info.msg) )
    
    // checking the user when he is disconnected
    socket.on('disconnect' , () => removeUser(socket.id))
})

// setting up the server
const PORT = 3000 || process.env.PORT
server.listen(PORT , () => console.log(`Server running on port ${PORT}`))