const express = require('express')
const path = require('path')
const session = require('express-session')
const pageRouter = require('./routes/pages')
const socketio = require('socket.io') 
const http = require('http')
const {joinUser,removeUser,findUser,showRoom} = require('./utils/users')
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
    socket.on('joinRoom' , info => {
        info.id1.forEach(i => {
            room = i > info.id ? `${info.id}+${i}` : `${i}+${info.id}`
            user = joinUser(room,socket.id)
            socket.join(user.room)
        })

    })

    // checking the user when he is disconnected
    socket.on('disconnect' , () => removeUser(socket.id))
    
    // when the user connects he joins all the rooms i.e. all the group he is in
    socket.on('joinGroupRoom' , info => {
        info.rooms.forEach(room => {
            if(findUser(room.toString(),info.id) < 0) {
                user = joinUser(room.toString(),socket.id)
                socket.join(user.room)
            }
        })
    })

    // to send the message to all the users who are connected to the room in the groups
    socket.on('sendmsg' , info => socket.broadcast.to(info.room).emit('message', info.msg) )

    socket.on('showRoom' , () => showRoom())
})

// setting up the server
const PORT = 3000 || process.env.PORT
server.listen(PORT , () => console.log(`Server running on port ${PORT}`))