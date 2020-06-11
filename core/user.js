const db = require('./database_connect')
const bcrypt = require('bcryptjs')
const moment = require('moment')

function User(){}

User.prototype = {

    find : function(user = null, callback){
        // to get the find id of the current user 
        if(user)
            var field = Number.isInteger(user) ? 'id' : 'Email'

        let query = `SELECT * FROM users WHERE ${field} = ?`
        
        db.query(query,user,function(err,result){
            if(err)
                throw err
            if(result.length)
                callback(result[0])
            else
                callback(null)
        })
    },

    // create a new user
    create : function(body, callback){
        let pwd = body.password
        body.password = bcrypt.hashSync(pwd,10)
        c = 0
        
        var bind = []

        for(prop in body)
            bind.push(body[prop])
        bind.push(c)
        
        q = `SELECT Email FROM users WHERE Email = ?`
        
        db.query(q,body.email, function(err,r){
            if(err) throw err
            
            if(!r.length){
                let sql = `INSERT INTO users(Name,Email,Password,connections) VALUES (?, ?, ?, ?)`
                db.query(sql, bind, function(err, result){
                    if(err) throw err
                    callback(result.insertId)
                })
            }
            else{
                console.log('User already Exists')
                callback(null)
            }
        })
    },

    login : function(Email,Password,callback){
        this.find(Email , function(result) {
            if(result){
                if(bcrypt.compareSync(Password, result.Password)) {
                    callback(result)
                    return
                }
            }
            callback(null)
        })
    },

    information : function(id,company,position,file ,callback){
        let file_name
        if(file == undefined)
            file_name = null
        else 
            file_name = file.filename

        let info = []
        info.push(company)
        info.push(position)
        info.push(file_name)
        info.push(id)
        
        let query = "UPDATE users SET Company = ? , Position = ?, DP = ?  WHERE id = ?"
        db.query(query ,info ,function(err,result){
            if(err) throw err
            callback(result)
        })
    },

    signUpload : function(id,sign,callback){
        let info = []
        info.push(sign)
        info.push(id)
        let query = "UPDATE users SET Sign = ? WHERE id = ?"
        db.query(query, info, function(err,result) {
            if(err) throw err
            callback(result)
        })
    },

    update_det : function(param, callback) {
        det = []
        for(prop in param)
            det.push(param[prop])
        
        let query = `UPDATE users SET Company = ?, Position = ? WHERE id = ?`
        db.query(query, det, function(err,result) {
            if(err) throw err
            callback(result)
        })
    },

    update_password : function(password, callback) {
        pass = []
        for(item in password){
            pass.push(password[item])
        }

        let query = "UPDATE users SET Password = ? WHERE id = ?"
        db.query(query, pass, function(err,result) { 
            if(err) throw err
            callback(result)
        })
    },

    get_details : function(id , callback){
        let query = "SELECT id,Name, Email,Company, Position, DP, Sign, connections FROM users WHERE id = ?"
        db.query(query, id ,function(err,result) {
            if(err) throw err
            callback(result)
        })
    },

    people : function(company, id, callback){
        c = `%${company}%`
        det = []
        det.push(c)
        det.push(id)
        //c = '%ass%'
        let query = 'SELECT id,Name,Company,DP FROM users WHERE Company LIKE ? AND id <> ?'
        db.query(query, det, function(err,result) {
            if(err) throw err
            callback(result)
        })
    },
    
    connect : function(shepard, master, callback) {
        room = shepard > master ? `${master}+${shepard}` : `${shepard}+${master}`
        ids = []
        ids.push(shepard)
        ids.push(master)
        ids.push(room)
        
        let query = 'INSERT INTO connections (shepard, master, room) VALUES (?, ?, ?)'
        db.query(query, ids, (err,result) => {
            if(err) throw err

            else{

                let query2 = 'SELECT connections FROM users WHERE id = ?'

                db.query(query2, shepard,(err2, ress) => {
                    connections = ress[0].connections
                    connections++

                    let update_c = []
                    update_c.push(connections)
                    update_c.push(shepard)

                    let query3 = 'UPDATE users SET connections = ? WHERE id = ?'
                    
                    db.query(query3,update_c, (err33,ress33) => err33 ? console.log('There was an error') : console.log('Updated'))
                })                
                callback(result)
            }
        })
    },

    getallconnections : (id, callback) => {
        let query = 'SELECT master FROM connections WHERE shepard = ?'
        db.query(query, id, (err,result) => {
            if(err) throw err
            callback(result)
        })
    },

    getAconnections : (shepard, master, callback) => {
        ids = []
        ids.push(shepard)
        ids.push(master)

        let query = 'SELECT shepard FROM connections WHERE shepard = ? AND master = ?'
        db.query(query, ids, (err,result) => {
            if(err) throw err
            callback(result)
        })
    },

    disconnect : (shepard, master, callback) => {
        ids = []
        ids.push(shepard)
        ids.push(master)
        
        let query = 'DELETE FROM connections WHERE shepard = ? AND master = ?'
        db.query(query, ids, (err,result) => {
            if(err) throw err
            callback(result)
        })
    },

    new_conn : (id, callback) => {
        let query = 'SELECT users.Name,users.id FROM users INNER JOIN connections ON users.id=connections.shepard WHERE connections.master = ? ORDER BY connections.id DESC '

        db.query(query, id, (err,res) => {
            if(err) throw err
            callback(res)
        })
    },

    create_group : (name, m , callback) => {

        time = moment().format('MMMM Do YYYY, h:mm:ss A')
        
        group = []
        group.push(name)
        group.push(time)

        let sql = 'INSERT INTO groups (Name,Timestamp) VALUES (?,?)'
        db.query(sql,group, (err,res) => {
            if(err) throw err
            else {
                groupid = res.insertId
                members = m.split(',')
                members.forEach((element,index) => {
                    type = ''
                    index == members.length-1 ? type = 'admin' : type = 'member'
                    id = parseInt(element)
                    member = []
                    member.push(groupid)
                    member.push(id)
                    member.push(type)
                    member.push(time)

                    let query = 'INSERT INTO groupmembers (groupid,memberid,type,Timestamp) VALUES (?,?,?,?)'

                    db.query(query,member, (e,r) => {
                        if(e) throw e
                    })
                })
            }
            callback(res)
        }) 
    },

    get_groups : (id, callback) => {
        let query = 'SELECT groups.id, groups.Name FROM groups INNER JOIN groupmembers ON groups.id=groupmembers.groupid WHERE groupmembers.memberid = ? ORDER BY groups.Name ASC'
        db.query(query,id, (err,res) => {
            if(err) throw err
            callback(res)
        })
    },

    // get all the documents of a particular user
    getDocs : (email, callback) => {
        let query = 'SELECT * FROM documents WHERE Email = ?'
        db.query(query,email, (err,result) => {
            if(err) throw err
            callback(result)
        })
    },

    // insert the document details in 
    putDocs : (name,email,pwd,des, callback) => {
        pwd = bcrypt.hashSync(pwd,10)
        time = moment().format('lll')
        det = []
        det.push(name)
        det.push(email)
        det.push(pwd)
        det.push(des)
        det.push(time)
        
        let query = `INSERT INTO documents (Name,Email,Password,Description,Timestamp) VALUES (?, ?, ?, ?, ?)`
                    
        db.query(query,det, (err,res) => {
            if(err) throw err
            callback(res)
        })
        
    },

    // saves the changes made in the document
    saveDoc : (id, content, callback) => {
        det = []
        det.push(content)
        det.push(id)
        let query = 'UPDATE documents SET Content = ? WHERE id = ?'
        db.query(query,det,(err,res) => {
            if(err) throw err
            callback(res)
        })
    },

    // find the document the user has requested for
    findDoc: (id, callback) => {
        let query = 'SELECT id, Name, Email FROM documents WHERE id = ?'
        db.query(query,id,(err,result) => {
            if(err) throw err
            callback(result)
        })
    },

    getContent: (id, callback) => {
        let query = 'SELECT Content FROM documents WHERE id = ?'
        db.query(query, id, (err, result) => {
            if (err) throw err
            callback(result)
        })
    },

    // get all the docs
    getDocs : (email, callback) => {
        let query ='SELECT * FROM documents WHERE Email = ?'
        db.query(query,email, (err,result) => {
            if(err) throw err
            callback(result)
        })
    },

    // to confirm the password of the document
    confirm_doc_pas : (pwd,id, callback) => {
        let query = 'SELECT Password FROM documents WHERE id = ?'
        db.query(query,id, (err,result) => {
            if(err) throw err
            callback(result.Password)
        })
    },

    // for getting the members of a group
    getMembers : (id, callback) => {
        let query = 'SELECT users.Name, users.id, groupmembers.type FROM users INNER JOIN groupmembers ON users.id=groupmembers.memberid WHERE groupmembers.groupid = ? ORDER BY groupmembers.type ASC'
        db.query(query,id, (err,result) => {
            if(err) throw err
            callback(result)
        })
    },
    
    // request for making the admin
    makeAdmin : (gid,mid, callback) => {
        data = []
        data.push('admin')
        data.push(gid)
        data.push(mid)
        let query = 'UPDATE groupmembers SET type=? WHERE groupid=? AND memberid=?'
        db.query(query,data,(err,result) =>{
            if(err) callback('Error in making admin')
            callback(`${mid} has been made the admin`)
        })
    },

    // add members to a group
    add_members : (body, callback) => {
        members = body.members.split(',')
        time = moment().format('MMMM Do YYYY, h:mm:ss A')
        members.forEach(id => {
            info = []
            type = 'member'
            info.push(parseInt(body.gid))
            info.push(parseInt(id))
            info.push(type)
            info.push(time)            
            let query = 'INSERT INTO groupmembers (groupid,memberid,type,Timestamp) VALUES (?,?,?,?)'
            db.query(query,info, (err,res) => console.log(err ? err : res) )
        })
        callback(true)    
    },

    // put the message in the database
    put_message : (body, callback) => {
        let info = []
        for(element in  body)
            info.push(body[element])
        d = moment().format('LL')
        t = moment().format('LT')
        info.push(d)
        info.push(t)
        let query = 'INSERT INTO messages (room,message,sent,type,Date,Time) VALUES (?, ?, ?, ?, ?, ?)'
        db.query(query, info, (err,res) => {
            if(err) throw err
            else callback('message added')
        }) 
    },

    // get the messages 
    getRecentMsg : (room, msg, callback) => {
        let query = `SELECT id,message,Time,Date,room FROM messages WHERE id IN (${msg}) ORDER BY id DESC`
        db.query(query, room, (err,res) => {
            if(err) throw err
            callback(res)
        })
    },

    // get all the messages for a particular user
    get_all_messages : (id, callback) => {
        let query = 'SELECT users.Name, messages.message, messages.Time, messages.sent FROM users INNER JOIN messages ON users.id=messages.sent WHERE messages.room = ? ORDER BY messages.id ASC'

        db.query(query, id, (err,res) => {
            if(err) throw err
            else callback(res)
        })
    },

    // to get all the connections of the logged in user
    connections : (id, callback) => {
        let query = 'SELECT users.id, users.Name FROM users INNER JOIN connections ON users.id=connections.master WHERE shepard=? ORDER BY users.Name ASC'
        db.query(query, id, (err,res) => {
            if(err) throw err
            callback(res)
        })
    },

    // to check whether the requested user is bidirectionally connected
    bconnection : (shepard, master, callback) => {
        ids = []
        ids.push(shepard)
        ids.push(master)

        let query = 'SELECT id FROM connections WHERE master=? AND shepard=?'
        db.query(query, ids, (err,res) => {
            if(err) throw err
            callback(res)
        })
    }

}

// to select the first 10 messages of a certain chat
// SELECT * FROM messages WHERE room='2' AND id<(SELECT MAX(id) FROM messages WHERE room ='4+9')+1 ORDER BY id DESC LIMIT 10

// to select the first 10 messages of a group chat with name and other details
// SELECT messages.id ,messages.sent, users.Name, messages.message, messages.Time FROM users 
// INNER JOIN messages ON users.id=messages.sent 
// WHERE messages.room='2' AND messages.id<(SELECT MAX(id) FROM messages WHERE messages.room ='2')+1 
// ORDER BY messages.id DESC LIMIT 10

module.exports = User 