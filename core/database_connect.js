const util = require('util')
const mysql = require('mysql')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'node'
})

db.getConnection((err,connection) => {
    if(err)
        console.error("Something went wrong")
    if(connection)
        connection.release()
    return
})

db.query = util.promisify(db.query)

module.exports = db