const express = require('express')
const router = express.Router()
const User = require('../core/user')
const multer = require('multer')
const path = require('path')
const remove = require('remove.bg')
const fs = require('fs')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')

const app = express()
//server static files
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
const user = new User()
app.use(bodyParser.urlencoded({ extended: true }))


// get index page
router.get('/', (req, res, next) => {
    let user = req.session.user
    if (user) {
        res.redirect('/home')
        return
    }
    res.render('index', {
        title: 'Login',
        error: ''
    })
})

// post login data
router.post('/', (req, res, next) => {
    user.login(req.body.email, req.body.password, function (result) {
        if (result) {
            req.session.user = result

            if (result.Company === null)
                res.redirect('/setup')
            else if (result.Sign === null)
                res.redirect('/remove')
            else
                res.redirect('/chat')
        }
        else {
            res.render('index', {
                title: 'Login',
                error: 'Incorrect Email or Password'
            })
        }
    })
})

// post signup data
router.post('/signup', (req, res, next) => {
    let userInput = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    }

    user.create(userInput, function (lastId) {
        if (lastId) {
            user.find(lastId, (result) => {
                req.session.user = result
                res.redirect('/setup.pug')
            })
        }
        else {
            res.render('index', {
                title: 'Login',
                error: 'User Already Exists'
            })
        }
    })
})

//logout request
router.get('/logout', (req, res, next) => {
    if (req.session.user) {
        req.session.destroy(() => res.redirect('/'))
    }
    else
        res.redirect('/')
})

//set up the home page
router.get('/home', (req, res, next) => {
    if (req.session.user) {
        if (req.session.user.Company == null)
            res.redirect('/setup')
        else {
            res.render('home', {
                title: 'Home',
                user: req.session.user
            })
        }
    }
    else
        res.redirect('/')
})

// get setup page
router.get('/setup', (req, res, next) => {
    let user = req.session.user
    if (user) {
        if (user.Company == null) {
            n = user.Name
            name = n.split(" ")
            res.render('setup', {
                title: 'Setup',
                name: 'Welcome, ' + name[0],
                user: user
            })
            return
        }
        else {
            res.redirect('/home')
        }
    }
    else
        res.redirect('/')
})

// set storage engine for profile
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, callback) {
        callback(null, Date.now() + path.extname(file.originalname))
    }
})

//init upload for profile
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        checkFileType(file, callback)
    }
}).single('profile_image')


//post request to store the profile photo
router.post('/upload', (req, res, next) => {
    u = req.session.user
    upload(req, res, (err) => {
        if (err) {
            res.render('setup', {
                msg: err
            })
        }
        else {
            if (req.file != undefined)
                console.log("File Uploaded")
            else
                console.log('No file selected')
        }

        user.information(u.id, req.body.company, req.body.position, req.file, function (result) {
            if (result)
                res.redirect('/remove.pug')
            else
                console.log('There was an error')
        })
    })
})

// storage engine for signature
const storage_sign = multer.diskStorage({
    destination: './public/signature',
    filename: function (req, file, callback) {
        callback(null, Date.now() + path.extname(file.originalname))
    }
})

//init upload for signature
const upload_sign = multer({
    storage: storage_sign,
    fileFilter: function (req, file, callback) {
        checkFileType(file, callback)
    }
}).single('sign')

// get remove background page
router.get('/remove', (req, res, next) => {
    let user = req.session.user
    if (user) {
        if (user.Sign == null) {
            n = user.Name
            name = n.split(" ")
            res.render('remove', {
                title: 'Remove',
                name: 'Welcome ' + name[0]
            })
            return
        }
        else
            res.redirect('/home')
    }
    else
        res.redirect('/')
})

//post request for signature
router.post('/remove_bg', (req, res, next) => {
    upload_sign(req, res, (err) => {
        if (err)
            console.log(err)
        else {
            img_name = remove_bg(req.file)
            id = req.session.user.id
            user.signUpload(id, img_name, function (result) {
                if (result) {
                    res.redirect('/home')
                }
                else
                    console.log('There was an error')
            })

        }
    })

})

// API call to remove background of the signature
function remove_bg(file) {
    const localFile = './' + file.path
    img_name = Date.now() + '.png'
    const outputFile = './public/signature/' + img_name

    remove.removeBackgroundFromImageFile({
        path: localFile,
        apiKey: "pPfZgug49pttUYEC8PWRDUwR",
        size: "regular",
        type: "auto",
        scale: "50%",
        outputFile
    })
    fs.unlinkSync(localFile)
    return img_name
}

//check file type function for profile photo
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/
    const ext = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && ext)
        return cb(null, true)
    else
        cb('Error : Images Only!')
}

//set up profile page
router.get('/profile', (req, res, next) => {
    if (req.session.user) {
        res.render('profile', {
            title: 'Profile',
            user: req.session.user
        })
    }
    else
        res.redirect('/')
})

// get profile update page
router.get('/update_profile', (req, res, next) => {
    if (req.session.user) {
        res.render('update_profile', {
            title: 'Update Profile',
            user: req.session.user
        })
    }
    else
        res.redirect('/')
})

// request for updating details
router.post('/update_details', (req, res, next) => {
    det = {
        company: req.body.company,
        position: req.body.position,
        id: req.session.user.id
    }

    user.update_det(det, function (result) {
        if (result)
            res.send('Details Updated')
        else
            res.send('Failed to update details')
    })
})

// get profile of a particular person
router.get('/profile/:id', (req, res, next) => {
    if (req.session.user) {
        let id = req.params.id
        user.get_details(id, (result) => {
            if (result.length) {
                img = result[0].DP == null ? 'download.png' : result[0].DP
                res.render('Profile', {
                    title: result[0].Name + "'s Profile",
                    user: req.session.user,
                    person: result,
                    img: img
                })
            }
            else
                res.send('Not Found')
        })
    }
})

// request to get connection between 2 specific people
router.get('/get_connection', (req, res, next) => {
    if (req.session.user) {
        shepard = req.session.user.id
        master = req.query.master
        user.getAconnections(shepard, master, (result) => {
            res.send(result)
        })
    }
    else
        res.redirect('/')
})

//request for chat room
router.get('/chat', (req, res, next) => {
    info = {}
    rooms = []
    if (req.session.user) {
        user.get_groups(req.session.user.id, (resultGroup) => {
            info.groups = resultGroup
            info['groups'].forEach(e => rooms.push(e.id.toString()))
            user.connections(req.session.user.id, (resultConn) => {
                info.connections = resultConn
                info.connections.forEach(e => rooms.push(req.session.user.id > e.id ? `${e.id}+${req.session.user.id}` : `${req.session.user.id}+${e.id}`))
                msg = ''
                rooms.forEach((e, i) => {
                    msg += '(SELECT MAX(id) FROM messages WHERE room = ?)'
                    if (i < rooms.length - 1)
                        msg += ','
                })
                user.getRecentMsg(rooms, msg, (result) => {
                    res.render('chat_room', {
                        title: 'Chat Room',
                        user: req.session.user,
                        info: info,
                        messages: result
                    })
                })
            })
        })
    }
    else res.redirect('/')
})

// request to get the document page
router.get('/document', (req, res, next) => {
    if (req.session.user) {
        user.getDocs(req.session.user.Email, (result) => {
            let docs
            docs = result.length ? result : 'No documents were made'
            res.render('document', {
                title: 'Documents',
                user: req.session.user,
                error: '',
                docs: docs
            })
        })
    }
    else res.redirect('/')
})


// request to store the document details into the database
router.post('/docs', (req, res, next) => {
    name = req.body.name.trim()
    des = req.body.des.trim()
    pwd = req.body.pwd.trim()
    user.putDocs(name, req.session.user.Email, pwd, des, (result) => {
        if (result) {
            p = result.insertId
            res.redirect(`/editor/${name.split(' ').join('-')}/${p}`)
        }
        else {
            res.render('document', {
                title: 'Documents',
                user: req.session.user,
                error: 'There was an error creating the document'
            })
        }
    })
})

// save the changes in the document
router.post('/saveDoc', (req, res, next) => {
    user.saveDoc(req.body.room, req.body.content, (result) => res.send(result))
})

// request to get the editor
router.get(`/editor/:name/:id`, (req, res, next) => {
    if (req.session.user) {
        name = req.params.name.split('-').join(' ')
        id = req.params.id
        user.findDoc(id, (result) => {
            if (result.length) {
                if (result[0].Name == name) {
                    res.render('editor', {
                        title: `${name} - Editor`,
                        user: req.session.user,
                        document: result
                    })
                }
                else res.send('document not found')
            }
            else
                res.send('document not found')
        })
    }
    else res.redirect('/')
})

// get content of the document
router.get('/get/document/content', (req, res, next) => {
    const id = parseInt(req.query.id)
    user.getContent(id, result => {
        res.send(result)
    })
})

// request to fetch sign for the editor
router.get('/fetch_sign', (req, res, next) => {
    if (req.session.user) {
        if (bcrypt.compareSync(req.query.pwd, req.session.user.Password))
            res.send(req.session.user.Sign)
        else
            res.send('Password is wrong')
    }
    else res.redirect('/')
})

// to get the id of the user logged in
router.get('/getid', (req, res, next) => {
    if (req.session.user) {
        id = req.session.user.id.toString()
        res.send({ id: id, name: req.session.user.Name })
    }
    else res.redirect('/')
})

// get all the groups and the birdirectionally connected members
router.get('/getusers', (req, res, next) => {
    let info = { groups: [], connection: [] }
    user.getusers(req.session.user.id, result1 => {
        info.connection = result1
        user.get_groups(req.session.user.id, result2 => {
            info.groups = result2
            res.send(info)
        })
    }) 
})

// put the send document msg into the database
router.post('/d_message', (req, res, next) => {
    const info = req.body['info[]']
    const questionsMarks = req.body.questionsMarks
    user.put_doc_msg(info, questionsMarks, result => {
        res.send(result)
    })
})

module.exports = router