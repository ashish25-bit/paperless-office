const menu_options = document.querySelector('.menu_options')
const chat_con = document.querySelector('.chats')
const group_con = document.querySelector('.groups')
const msg_con = document.querySelector('.message')
let chats = document.querySelectorAll('.chat_name')
let groups = document.querySelectorAll('.group')
let recent_msg = document.querySelectorAll('.msg_recent_con')
const group_info = document.querySelector('.group_info')
const add_mem_con = document.querySelector('.add_member_names_con')
const add_member_button = document.querySelector('.add_mem_con')
let input_box = '<div class="msg_input_box_con"><textarea type="text" name="message" class="msg_input" placeholder="Your message..." ></textarea><button class="msg_send_btn">Send</button></div>'
const messages = document.querySelector('.messages')
let loggedIn // this will contain the id of the current logged in user
let loggedName // this will contain the name of the current logged in user
let b_members = [] // this will contain the ids of the bidirectional users
let gid // this will contain the group id of the current opened group
let selected_ids = [] // this will contain the ids of the members who will be added to the group
let currentChatRoom // this will contain the current chat room opened
let acfg = '' // allowed chats for groups
let month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const socket = io()

{
    menu_options.style.display = 'none'
    display_none()
    msg_con.style.display = 'block'
    add_member_button.style.display = 'none'

    loggedIn = parseInt(document.querySelector('.profile_photo').getAttribute('data-profile'))
    loggedName = document.querySelector('.img_profile_con span').innerText
    socket.emit('join', loggedIn)
    // join the member to the chat rooms of the connections and the groups
    roomids = []
    // getting the room of the groups
    if (groups.length) {
        groups.forEach(e => {
            id = e.getAttribute('data-group-id').toString()
            roomids.push(id)
        })
    }
    // getting the rooms for the connections
    if (chats.length) {
        chats.forEach(e => {
            id = e.getAttribute('data-connection-id')
            roomids.push(id > loggedIn ? `${loggedIn}+${id}` : `${id}+${loggedIn}`)
        })
    }
    socket.emit('joinRoom', roomids)
    // socket.emit('showRoom')


    // get the data of the birectionally connected users
    if (chats.length) {
        chats.forEach(e => {
            id = parseInt(e.getAttribute('data-connection-id'))
            $.ajax({
                url: '/bidirectional_connections',
                method: 'GET',
                data: { master: id },
                success: (response) => {
                    if (response.length) {
                        c = { name: e.innerHTML, id: parseInt(e.getAttribute('data-connection-id')) }
                        acfg += `<p class="chat_name chat_for_group" data-profile-id=${c.id}>${e.innerHTML}</p>`
                        b_members.push(c)
                    }
                }
            })
        })
    }
}

// to select the display people container
document.querySelector('.chats_con_display').addEventListener('click', () => {
    display_none()
    chat_con.style.display = 'block'
})

// to display the group container
document.querySelector('.group_con_display').addEventListener('click', () => {
    display_none()
    group_con.style.display = 'block'
})

// to display the message container
document.querySelector('.msg_con_display').addEventListener('click', () => {
    display_none()
    msg_con.style.display = 'block'
})

// to display the chat box for group or connection
recent_msg.forEach(funcRecent)

function funcRecent(e) {
    e.addEventListener('click', () => {
        c = e.hasAttribute('group') ? 'group' : 'chat'
        // for groups
        if (c == 'group') {
            groupInfoView()
            add_member_button.style.display = 'none'
            gid = e.getAttribute('data-group-id')
            currentChatRoom = gid
            insertInputBox(e.querySelector('.msg_recent_name').innerHTML, 'group')
            // for getting the group info con
            document.querySelector('.group_info_btn').addEventListener('click', () => {
                group_info.classList.toggle('groupInfoReveal')
                group_info.classList.contains('groupInfoReveal') ? group_info.classList.remove('groupInfoHide') : group_info.classList.add('groupInfoHide')
                // to get the group members as soon as the group info container is revealed
                getGroupMembers(gid)
            })
            getChatMessages(gid, 'group')
            messaging(gid, 'group')
        }
        // for connections
        else {
            groupInfoView()
            id = parseInt(e.getAttribute('data-connection-id'))
            i = b_members.findIndex(member => member.id == id)
            if (i >= 0) {
                insertInputBox(e.querySelector('.msg_recent_name').innerHTML, 'connection')
                room = id > loggedIn ? `${loggedIn}+${id}` : `${id}+${loggedIn}`
                currentChatRoom = room
                getChatMessages(room, 'personal')
                messaging(room, 'personal')
            }
            else {
                dd = document.createElement('div')
                dd.innerHTML = '<p>You are not connected bidirectionally</p>'
                if (messages.childNodes.length > 1)
                    messages.removeChild(messages.childNodes[1])
                messages.appendChild(dd)
            }
        }
    })
}

// to display the chat box with messages
chats.forEach(e => {
    e.addEventListener('click', () => {
        groupInfoView()
        id = parseInt(e.getAttribute('data-connection-id'))
        i = b_members.findIndex(member => member.id == id)
        if (i >= 0) {
            insertInputBox(e.innerHTML, 'connection')
            room = id > loggedIn ? `${loggedIn}+${id}` : `${id}+${loggedIn}`
            currentChatRoom = room
            getChatMessages(room, 'personal')
            messaging(room, 'personal')
        }
        else {
            dd = document.createElement('div')
            dd.innerHTML = '<p>You are not connected bidirectionally</p>'
            if (messages.childNodes.length > 1)
                messages.removeChild(messages.childNodes[1])
            messages.appendChild(dd)
        }
    })
})

// to display the group chat box
groups.forEach(funGroup)

function funGroup(e) {
    e.addEventListener('click', () => {
        groupInfoView()
        add_member_button.style.display = 'none'
        gid = e.getAttribute('data-group-id')
        currentChatRoom = gid
        insertInputBox(e.innerHTML, 'group')

        // for getting the group info con
        document.querySelector('.group_info_btn').addEventListener('click', () => {
            group_info.classList.toggle('groupInfoReveal')
            group_info.classList.contains('groupInfoReveal') ? group_info.classList.remove('groupInfoHide') : group_info.classList.add('groupInfoHide')
            // to get the group members as soon as the group info container is revealed
            getGroupMembers(gid)
        })
        getChatMessages(gid, 'group')
        messaging(gid, 'group')
    })
}

// this function will handle the message sent by the user
function messaging(room, type) {
    let i = document.querySelector('.msg_input')
    send = document.querySelector('.msg_send_btn')
    send.addEventListener('click', () => {
        if (i.value != '') {
            if (type == 'personal') {
                socket.emit('sendmsg', { msg: i.value, room: room })
                appendMsg(i.value, 'ques', type, '')
            }
            if (type == 'group') {
                socket.emit('sendGroupmsg', { msg: i.value, room: room, name: loggedName })
                appendMsg(i.value, 'ques', type, 'You')
            }
            messageToDatabase(room, i.value, loggedIn, 'text')
            updateRecent(i.value, room, type)
        }

    })

    i.addEventListener('keyup', e => {
        if (e.keyCode == 13) {
            if (i.value != '') {
                console.log(i.value)
                if (type == 'personal') {
                    socket.emit('sendmsg', { msg: i.value, room: room })
                    appendMsg(i.value, 'ques', type, '')
                }
                if (type == 'group') {
                    socket.emit('sendGroupmsg', { msg: i.value, room: room, name: loggedName })
                    appendMsg(i.value, 'ques', type, 'You')
                }
                messageToDatabase(room, i.value, loggedIn, 'text')
                updateRecent(i.value, room, type)
            }
        }
    })
}

// put the message the database
function messageToDatabase(room, msg, sent, type) {
    msg = msg.trim()
    info = { room, msg, sent, type }
    $.ajax({
        url: '/put_message',
        method: 'POST',
        data: info,
        success: response => { return }
    })
}

// to get the group members when the member button is clicked
$('.show_members').on('click', () => getGroupMembers(gid))
// to get the shared documents when the document button is clicked
$('.show_docs').on('click', () => {
    $('.docs_media').html('No documents yet')
})
// to get the media shared in the group 
$('.show_media').on('click', () => {
    $('.docs_media').html('No media yet')
})

// get all the group members for a particular
function getGroupMembers(id) {
    id = parseInt(id)
    $.ajax({
        url: '/group_members',
        method: 'GET',
        data: { id: id },
        success: response => {
            let gm = ''
            let makeAdmin = false
            response.forEach(element => {
                gm += '<div>'
                if (element.id == loggedIn) {
                    gm += `<div class="gm-name"><p data-profile-id='${element.id}'><a href="/profile">You</a></p>`
                    if (element.type == 'admin') {
                        gm += `<span>Admin</span>`
                        add_member_button.style.display = 'block'
                        makeAdmin = true
                    }
                }
                else if (element.type == 'admin') {
                    gm += `<div class="gm-name"><p data-profile-id='${element.id}'><a href="/profile/${element.id}">${element.Name}</a></p>`
                    gm += `<span>Admin</span>`
                }
                else {
                    gm += `<div class="gm-name"><p data-profile-id='${element.id}'><a href="/profile/${element.id}">${element.Name}</a></p>`
                    if (makeAdmin)
                        gm += `<button class='make_admin_btn' data-profile-id='${element.id}'>Make Admin</button>`
                }
                gm += '</div>'
            })
            $('.docs_media').html(gm)
        }
    })
        .then(() => {
            // checking whether the make admin button exists
            let ma = document.querySelectorAll('.make_admin_btn')
            // if btn exists the event listener will be added   
            if (ma.length) {
                ma.forEach(element => {
                    element.addEventListener('click', () => {
                        i = parseInt(element.getAttribute('data-profile-id'))
                        g = parseInt(id)
                        info = { gid: g, mid: i }
                        parent = element.parentElement
                        span = document.createElement('span')
                        $.ajax({
                            url: '/make_admin',
                            method: 'POST',
                            data: info,
                            success: response => {
                                if (response != 'Error in making admin') {
                                    element.style.display = 'none'
                                    span.innerText = 'Admin'
                                }
                                else
                                    span.innerText = response
                                parent.appendChild(span)
                            }
                        })
                    })
                })
            }
        })
}
// UPDATE `groupmembers` SET type='member' WHERE groupid=2 AND memberid=4

// to add the members in the group
document.querySelector('.add_mem_btn').addEventListener('click', () => {
    add_mem_con.style.display = 'flex'
    mids = [] // this will contain the ids of the members who are currently in the group
    document.querySelectorAll('.gm-name p').forEach(element => {
        id = parseInt(element.getAttribute('data-profile-id'))
        if (id != loggedIn)
            mids.push(id)
    })
    nmtcbj = b_members.filter(n => { return mids.indexOf(n.id) == -1 }) // new members that can be joined
    mmm = ''
    if (nmtcbj.length)
        nmtcbj.forEach(n => mmm += `<div class='checkbox_con'><input data-id='${n.id}' type='checkbox' class='checkbox'> ${n.name}</div>`)
    else
        mmm = 'All the people you are connected with are joined in the group'
    $('.new_members_names').html(mmm)

    selected_ids = []
    const checbox = document.querySelectorAll('.checkbox')

    if (checbox.length) {
        checbox.forEach(element => {
            element.addEventListener('click', () => {
                namid = parseInt(element.getAttribute('data-id'))
                if (element.checked)
                    selected_ids.push(namid)
                else {
                    ir = selected_ids.indexOf(namid) // ir (immediately remove) 
                    selected_ids.splice(ir, 1)
                }
            })
        })
    }
})

// adding the members to the group 
document.querySelector('.add_members').addEventListener('click', () => {
    if (!selected_ids.length) {
        document.querySelector('.empty_selections').classList.add('addemptyclass')
        setTimeout(() => document.querySelector('.empty_selections').classList.remove('addemptyclass'), 2000)
    }
    else {
        id = parseInt(gid)
        info = {
            gid: id,
            members: selected_ids.toString()
        }
        $.ajax({
            url: '/add_members',
            method: 'POST',
            data: info,
            success: response => console.log(response)
        })
            .then(() => {
                add_mem_con.style.display = 'none'
                // this is to send the request to the newly joined members
                selected_ids.forEach(id => socket.emit('added', { id: id, room: gid }))
                // request to other members of the group who are connected in the group

            })
    }
})

// for canceling the addtion of a new member
document.querySelector('.cancel_add_mem').addEventListener('click', () => add_mem_con.style.display = 'none')

// for creating groups
document.querySelector('.create_group_chat').addEventListener('click', () => {
    document.querySelector('.container_msg_chats').style.display = 'none'
    // re-initializing the selected_id to prevent the data mixing
    selected_ids = []
    gcc = '<div class="select_group_chat_member">'
    gcc += '<input class="group_name" placeholder="Enter group name">'
    gcc += '<div class="con_can_con">'
    gcc += '<button class="confirm_create_group">Create Group</button>'
    gcc += '<button class="cancel_group">Cancel</button>'
    gcc += '</div>'

    gcc += acfg

    gcc += '</div>'
    $('.group_select').html(gcc)
    menu_chat()

    document.querySelectorAll('.chat_for_group').forEach(element => {
        element.addEventListener('click', () => {
            id = parseInt(element.getAttribute('data-profile-id'))

            if (!selected_ids.includes(id)) {
                element.classList.add('chat_for_group_selected')
                selected_ids.push(id)
            }

            else {
                element.classList.remove('chat_for_group_selected')
                ir = selected_ids.indexOf(id) // ir (immediately remove) 
                selected_ids.splice(ir, 1)
            }
        })
    })

    document.querySelector('.cancel_group').addEventListener('click', () => {
        document.querySelector('.container_msg_chats').style.display = 'block'
        $('.group_select').html('')
        $('.pop_up_msg').html('')
    })

    document.querySelector('.confirm_create_group').addEventListener('click', create_group)
})

function create_group() {
    g_name = document.querySelector('.group_name')
    if (g_name.value == '')
        $('.pop_up_msg').html('Enter name of the group')
    else if (selected_ids.length == 0)
        $('.pop_up_msg').html('Select atleast one recepient')
    else {
        selected_ids.sort(function (a, b) { return a - b })
        s = ''
        selected_ids.forEach(element => s += element + ',')
        info = {
            name: g_name.value,
            members: s
        }

        $.ajax({
            url: '/create_group',
            method: 'POST',
            data: info,
            success: response => {
                // add the users into the room of the group 
                r = []
                room = response.insertId.toString()
                r.push(room)
                socket.emit('joinRoom', r)
                refreshGroups()
                selected_ids.forEach(id => {
                    socket.emit('added', { id: id, room: room })
                })
            }
        })
    }
}

function refreshGroups() {
    $.ajax({
        url: '/refresh_groups',
        method: 'GET',
        success: response => {
            r = ''
            response.forEach(e => r += `<p class="group" data-group-id=${e.id}>${e.Name}</p>`)
            $('.group_select').html('')
            display_none()
            document.querySelector('.container_msg_chats').style.display = 'block'
            group_con.style.display = 'block'
            group_con.innerHTML = r
        }
    })
        .then(() => {
            // re-initializing group variable
            groups = document.querySelectorAll('.group')
            groups.forEach(funGroup)
        })
}

// to insert the message text-box for connections and groups
function insertInputBox(name, type) {
    dd = document.createElement('div')
    dd.classList.add('chat_name_msg')
    res = `<p class="chat_name_display">${name}</p>`
    if (type == 'group')
        res = `<div class="group_chat_header"><div class="chat_name_display">${name}</div><button class="group_info_btn">Group Info</button></div>`
    res += `<div class="chat_message"></div>`
    res += input_box
    dd.innerHTML = res
    if (messages.childNodes.length > 1)
        messages.removeChild(messages.childNodes[1])
    messages.appendChild(dd)
}

// to get the message for specific connection or group
function getChatMessages(room, type) {
    $.ajax({
        url: '/get_all_messages',
        method: 'GET',
        data: { id: room },
        success: (response) => appendMsg2(response, type)
    })
}

// for viewing the group info
function groupInfoView() {
    group_info.classList.remove('groupInfoReveal')
    if (group_info.classList.contains('groupInfoHide'))
        group_info.classList.add('groupInfoHide')
}

// appending the message to the chat message container
function appendMsg(msg, cls, type, name) {
    time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: 'false' })
    let div = document.createElement('div')
    div.classList.add(cls)
    m = ''
    if (type == 'group')
        m += `<p class="msg_name ${cls}_n">${name}</p><br/>`
    m += `<p class="cm">${msg}</p><br/><p class="ct">${time}</p>`
    div.innerHTML = m
    let msg_con = document.querySelector(".chat_message")
    msg_con.appendChild(div)
    msg_con.scrollTop = msg_con.scrollHeight
}

// appending all the messages to the container
function appendMsg2(messages, type) {
    messages.forEach(item => {
        let div = document.createElement('div')
        cls = item.sent == loggedIn ? 'ques' : 'ans'
        div.classList.add(cls)
        m = ''
        if (type == 'group')
            m = `<p class="msg_name ${cls}_n">${item.Name}</p><br/>`
        m += `<p class="cm">${item.message}</p><br/><p class="ct">${item.Time}</p>`
        div.innerHTML = m
        let msg_con = document.querySelector(".chat_message")
        msg_con.appendChild(div)
        msg_con.scrollTop = msg_con.scrollHeight
    })
}

// updating the recent message container
function updateRecent(msg, room, attribute) {
    i = document.querySelector('.msg_input')
    if (i != null) {
        i.value = ''
        i.focus()
    }
    d = new Date()
    date = `${month[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: 'false' })
    let ii
    for (i = 0; i < recent_msg.length; i++) {
        if (recent_msg[i].hasAttribute(attribute)) {
            r = recent_msg[i].getAttribute('data-room')
            if (r == room) {
                ii = i
                break
            }
        }
    }
    recent_msg[ii].querySelector('.msg_recent_date').innerText = date
    recent_msg[ii].querySelector('.msg_recent_msg').innerText = msg
    recent_msg[ii].querySelector('.msg_recent_time').innerText = time
    node = msg_con.removeChild(recent_msg[ii])
    msg_con.insertAdjacentElement("afterbegin", node)
}

// the menu button which will contain the options such as -> create group
document.querySelector('.menu_chat_btn').addEventListener('click', menu_chat)

// displaying and hiding the menu option
function menu_chat() {
    menu_options.style.display == 'block' ? menu_options.style.display = 'none' : menu_options.style.display = 'block'
}

// remove all the containers
function display_none() {
    chat_con.style.display = 'none'
    msg_con.style.display = 'none'
    group_con.style.display = 'none'
}

// get notified when you are added to the group
socket.on('group', info => {
    $.ajax({
        url: '/refresh_groups',
        method: 'GET',
        success: response => {
            r = ''
            response.forEach(e => r += `<p class="group" data-group-id=${e.id}>${e.Name}</p>`)
            group_con.innerHTML = r
        }
    })
        .then(() => {
            // re-initializing group variable
            r = []
            r.push(info.room)
            socket.emit('joinRoom', r)
            groups = document.querySelectorAll('.group')
            groups.forEach(funGroup)
        })
})

// get the message for personal chat
socket.on('message', info => {
    if (info.room == currentChatRoom)
        appendMsg(info.msg, 'ans', 'personal', '')
    updateRecent(info.msg, info.room, 'personal')
})

// get the message for the group chat
socket.on('messageGroup', info => {
    if (info.room == currentChatRoom)
        appendMsg(info.msg, 'ans', 'group', info.from)
    updateRecent(info.msg, info.room, 'group')
})