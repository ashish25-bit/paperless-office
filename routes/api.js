const express = require('express')
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser')
const User = require('../core/user')
const bcrypt = require('bcryptjs')

const app = express()
const user = new User()

//server static files
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.use(bodyParser.urlencoded({ extended: true }))

/**
 * For Home Page
 */

// request for people you may know
router.get('/people_you_may_know', (req, res, next) => {
    if (req.session.user) {
        user.people(req.session.user.Company, req.session.user.id, function (result) {
            if (result)
                res.send(result)
            else
                res.send('No Users')
        })
    }
    else
        res.redirect('/')
})

// request for getting all connections
router.get('/get_connections/:id', (req, res, next) => {
    if (req.session.user) {
        id = req.params.id
        user.getallconnections(id, (result) => {
            res.send(result)
        })
    }
    else res.redirect('/')
})

// request to connect
router.post('/connect', (req, res, next) => {
    shepard = req.session.user.id
    master = req.body.master
    user.connect(shepard, master, (result) => result ? res.send('connected') : res.send('There was an error connecting'))
})

// request for disconnecting between connections
router.get('/disconnect', (req, res, next) => {
    if (req.session.user) {
        master = req.query.master
        shepard = req.session.user.id
        user.disconnect(shepard, master, (result) => result ? res.send('Disconnected successfully') : res.send('There was an error disconnecting'))
    }
    else
        res.redirect('/')
})

// request for getting the newly formed connections
router.get('/get_conn_noti', (req, res, next) => {
    if (req.session.user) {
        user.new_conn(req.session.user.id, (result) => res.send(result))
    }
    else res.redirect('/')
})

/**
 * For Update Profile Page
 */

// request for updating password
router.post('/update_pwd', (req, res, next) => {
    new_pwd = bcrypt.hashSync(req.body.pwd, 10)
    pwd = req.session.user.Password
    old_pwd = req.body.old

    pass = {
        password: new_pwd,
        id: req.session.user.id
    }

    if (bcrypt.compareSync(old_pwd, pwd)) {
        user.update_password(pass, function (result) {
            if (result)
                res.send('Password Updated')
            else
                res.send('There was an error')
        })
    }
    else
        res.send('Password Entered is not correct')
})

// request for getting details
router.get('/get_details', (req, res, next) => {
    if (req.session.user) {
        user.get_details(req.session.user.id, function (result) {
            if (result)
                res.send(result)
            else
                res.send('No data is found')
        })
    }
    else
        res.redirect('/')
})

/**
 * For chat room
 */

// to get the bidirectional connections
router.get('/bidirectional_connections', (req, res, next) => {
    user.bconnection(req.session.user.id, req.query.master, (result) => res.send(result))
})

// post the sent message into the database
router.post('/put_message', (req, res, next) => {
    input = {
        room: req.body.room,
        msg: req.body.msg,
        sent: parseInt(req.body.sent),
        type: req.body.type
    }
    user.put_message(input, (result) => console.log(result))
})

// to get all the users in a group
router.get('/group_members', (req, res, next) => {
    if (req.session.user) {
        id = req.query.id
        user.getMembers(id, (result) => res.send(result))
    }
    else res.redirect('/')
})

// request for making the user admin of the group
router.post('/make_admin', (req, res, next) => {
    gid = req.body.gid
    mid = req.body.mid
    user.makeAdmin(gid, mid, (result) => res.send(result))
})

// request for adding the members
router.post('/add_members', (req, res, next) => {
    user.add_members(req.body, result => res.send(result))
})

// request to post the group details into the database
router.post('/create_group', (req, res, next) => {
    members = req.body.members + req.session.user.id
    user.create_group(req.body.name, members, (result) => res.send(result))
})

// refresh the div to get the groups
router.get('/refresh_groups', (req, res, next) => {
    if (req.session.user) {
        user.get_groups(req.session.user.id, result => res.send(result))
    }
})

// get all the messages for a particular room
router.get('/get_all_messages', (req, res, next) => {
    user.get_all_messages(req.query.id, (result) => res.send(result))
})

module.exports = router