const add_sign = document.querySelector('.add_sign') 
const pwd_con = document.querySelector('.pwd_con_sign')
const pwd = document.querySelector('.sign_pwd')
const content = document.querySelector('.doc_content') 
const share = document.querySelector('.share_doc')
const edit = document.querySelector('.edit_dd')
const save = document.querySelector('.save_content')
const groupBtn = document.querySelector('.group_btn')
const peopleBtn = document.querySelector('.people_btn')
const peopleCon = document.querySelector('.people')
const groupCon = document.querySelector('.groups')
const cancel = document.querySelector('.cancel')
const send = document.querySelector('.send')
const chats = document.querySelector('.share_chats_con')
const loggedId = parseInt(document.querySelector('.profile_photo').getAttribute('data-profile'))
const response_msg = document.querySelector('.response_msg')
let selected_chats = [] // the chats for selected for sending the document link
let room // the room of the editor
const socket = io()

{
    pwd_con.style.display = 'none'
    chats.style.display = 'none'
    // getting the room id of the editor
    room = share.getAttribute('data-doc-id')
    socket.emit('joinDocRoom', room)
    $.ajax({
        url: '/get/document/content',
        method: 'GET',
        data: { id: room },
        success: (response) => {
            content.innerHTML = response[0].Content
        }
    })
}

// password modal will be pooped up 
add_sign.addEventListener('click', () => pwd_con.style.display = 'block')

// validating the password for signature
document.querySelector('.cancel_sign').addEventListener('click', () => {
    pwd_con.style.display = 'none'
    $('.wrong_pwd').html('')
})

// saving the document
save.addEventListener('click', () => {
    det = {
        room: room,
        content: content.innerHTML
    }
    $.ajax({
        url: '/saveDoc',
        method: 'POST',
        data: det,
        success: (response) => {
            responseFunction(response)
        }
    })
})

// fetching the signature and appending it to the document
document.querySelector('.fetch_sign').addEventListener('click', () => {
    if (pwd.value == '')
        alert('Enter Password...')
    else {
        $.ajax({
            url: '/fetch_sign',
            method: 'GET',
            data: { pwd: pwd.value },
            success: (response) => {
                if (response == 'Password is wrong')
                    $('.wrong_pwd').html(response)
                else {
                    pwd_con.style.display = 'none'
                    img_src = `/signature/${response}`
                    var img = document.createElement("img")
                    img.src = img_src
                    img.setAttribute('contenteditable', 'true')
                    img.classList.add('signed_img')
                    content.appendChild(img)
                }
            }
        })
    }
})

// edit document details
if (edit !== null) {
    edit.addEventListener('click', () => {

    })
}

// sending the content to other poeple joined in the editor socket
content.addEventListener('keyup', event => {
    if (event.key == 'Escape') {
        event.preventDefault()
        preContent = document.createTextNode(content.innerHTML)
    }
    else
        socket.emit('docContent', content.innerHTML)
})

// get the content of the document and display it on the input element
socket.on('message', msg => content.innerHTML = msg)

// a modal will appear which will contain the groups and connections
share.addEventListener('click', () => {
    selected_chats = []
    chats.style.display = 'flex'

    peopleCon.innerHTML = ''
    groupCon.innerHTML = ''

    $.ajax({
        url: '/getusers',
        method: 'GET',
        success: response => {
            const { connection, groups } = response

            if (connection.length)
                connection.forEach(person => makeNode(person, 'people'))
            else
                peopleCon.innerText = 'No Connections'

            if (groups.length)
                groups.forEach(group => makeNode(group, 'groups'))
            else
                groupCon.innerText = 'No Groups'
        }
    })
})

// show the groups
groupBtn.addEventListener('click', () => {
    peopleCon.style.display = 'none'
    groupCon.style.display = 'block'
})

// show the people
peopleBtn.addEventListener('click', () => {
    peopleCon.style.display = 'block'
    groupCon.style.display = 'none'
})

// cancel sharing the document
cancel.addEventListener('click', () => chats.style.display = 'none')

// send the document to the selected people
send.addEventListener('click', () => {
    cancel.disabled = true
    send.disabled = true
    send.classList.add('disabled')
    cancel.classList.add('disabled')
    let questionsMarks = ''
    let info = []
    selected_chats.forEach(chat => {
        if (chat.includes('+'))
            socket.emit('sendmsg', { msg: 'Hello Friend From the editor', room: chat, type: 'document' })
        else
            socket.emit('sendGroupmsg', { msg: 'Hello Group From the editor', name: username_logged, room: chat, type: 'document' })
    })

    // room, message, sent, date, time, type
    let date = 'June 12, 2020'
    let time = '11:43 PM'
    selected_chats.forEach((chat, index) => {
        questionsMarks += '(?, ?, ?, ?, ?, ?)'
        if (index < selected_chats.length - 1)
            questionsMarks += ', '
        info.push(chat)
        info.push('From Editor')
        info.push(loggedId)
        info.push(date)
        info.push(time)
        info.push('text')
    })

    $.ajax({
        url: '/d_message',
        method: 'POST',
        data: {
            info,
            questionsMarks
        },
        success: response => {
            cancel.disabled = false
            send.disabled = false
            send.classList.remove('disabled')
            cancel.classList.remove('disabled')
            chats.style.display = 'none'
            responseFunction(response)
        }
    })

})

// display the response on some ajax calls
function responseFunction(msg) {
    response_msg.innerText = msg
    response_msg.classList.add('response_msg_active')
    setTimeout(() => {
        response_msg.innerText = ''
        response_msg.classList.remove('response_msg_active')
    }, 5000)
}

// making the nodes for the available chat connections and groups
function makeNode(details, type) {
    const { id, Name } = details

    let room = type !== 'people'
        ? id :
        loggedId > id ? `${id}+${loggedId}` : `${loggedId}+${id}`

    let div = document.createElement('div')
    let checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox")
    checkbox.setAttribute("id", room)
    checkbox.addEventListener('change', selectChats)
    div.appendChild(checkbox)
    let lable = document.createElement('lable')
    lable.innerText = Name
    lable.setAttribute("for", room)
    div.appendChild(lable)
    type === 'people' ? peopleCon.appendChild(div) : groupCon.appendChild(div)
}

// add the people who you want to send the document
function selectChats(e) {
    const id = e.target.getAttribute('id')
    if (selected_chats.includes(id)) {
        let index = selected_chats.indexOf(id)
        selected_chats.splice(index, 1)
    }
    else
        selected_chats.push(id)

    if (selected_chats.length) {
        send.classList.remove('disabled')
        send.disabled = false
    }
    else {
        send.classList.add('disabled')
        send.disabled = true
    }
}